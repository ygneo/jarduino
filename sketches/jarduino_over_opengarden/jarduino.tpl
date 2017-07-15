#include <OpenGarden.h>
#include <TimeAlarms.h>
#include "Wire.h" 


#define SOIL_MOISTURE     0
#define AIR_TEMPERATURE   1
#define AIR_HUMIDITY      2

#define ZONEID     0
#define TIMESTAMP  1
#define DURATION   2

const int numSensorTypes = 3;

const int numZones = 2;

const int analogInPins[] = {A0}; // Analog input pins

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = $soilMoistureMinSensorValues; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 1; // Number of checks should be done before sending data to serial

DateTime irrigatingStartDateTime[] = $irrigatingStartDateTimes; // For instance {DateTime(2017, 6, 22, 13, 10, 0), DateTime(2017, 6, 22, 13, 35, 0)}
const long int wateringTime[] = $wateringTimes; // Watering time in ms for every plant
const long int irrigatingFrequence[] = $irrigatingFrequences; // Irrigating frequence in seconds for every plant
boolean irrigatingTimeStarted = false;


void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);

  OpenGarden.initRTC();

  OpenGarden.initIrrigation(1);
  OpenGarden.initIrrigation(2);

  OpenGarden.irrigationOFF(1);
  OpenGarden.irrigationOFF(2);

  OpenGarden.initSensors();
}


int doWatering(int id) {
  int valve_number = id + 1;

  OpenGarden.irrigationON(valve_number);

  delay(wateringTime[id]);

  OpenGarden.irrigationOFF(valve_number);

  return wateringTime[id];
}

int readSoilMoisture(int sensor_id) {
  int soilMoisture = 0;

  if (sensor_id == 0) {
    OpenGarden.sensorPowerON();
    delay(500);
    soilMoisture = OpenGarden.readSoilMoisture();
    soilMoisture = map(soilMoisture, 0, 1023, 0, 100);
    OpenGarden.sensorPowerOFF();
  } else {
    soilMoisture = analogRead(analogInPins[sensor_id - 1]);
    soilMoisture = map(soilMoisture, 1023, 0, 0, 100);
  }

  return soilMoisture;
}

/* ---- */

int readAirHumidity() {
  OpenGarden.sensorPowerON();
  delay(1000);
  float airHumidity = OpenGarden.readAirHumidity();
  OpenGarden.sensorPowerOFF();
  return airHumidity;
}

int readAirTemperature() {
  OpenGarden.sensorPowerON();
  delay(1000);
  float airTemperature = OpenGarden.readAirTemperature();
  OpenGarden.sensorPowerOFF();
  return airTemperature;
}

void sendValuesToSerial (int values[][numSensorTypes])
{
  Serial.print("#sensors#");
  
  for (int i=0; i<numZones; i++) {
    String valuesString;
    valuesString += i;
    valuesString += "/[";
    for (int sensorType=0; sensorType < numSensorTypes; sensorType++) {
      valuesString += "[";
      valuesString += sensorType;
      valuesString += ",";
      valuesString += values[i][sensorType];
      valuesString += "]";
      if (sensorType != numSensorTypes - 1) {
        valuesString += ",";
      }
    }
    valuesString += "]";
    valuesString += "#";   
    Serial.print(valuesString);  
  }
}


void sendIrrigatingEventsToSerial (int irrigatingEvents[][3]) 
{
  String valuesString;

  Serial.print("#actuators#");
  for (int i=0; i < numZones; i++) {
    if (irrigatingEvents[i][TIMESTAMP] > 0) {
      valuesString += i;
      valuesString += ",";
      valuesString += irrigatingEvents[i][DURATION];
      valuesString += "#";   
    }
  }
  Serial.println(valuesString);  

}

void sendToSerial (int values[][numSensorTypes], int lastIrrigatingEvents[][3]) {
  DateTime now = OpenGarden.getTime();

  Serial.print("#time#");
  Serial.print(now.unixtime());
  Serial.print("#");
  sendValuesToSerial(values);
  sendIrrigatingEventsToSerial(lastIrrigatingEvents);
}

boolean isIrrigatingTime(int id) {
  DateTime now = OpenGarden.getTime();

  if (now.unixtime() >= irrigatingStartDateTime[id].unixtime()) {
    if (irrigatingTimeStarted) {
      // use freq
      return true;
    } else { 
      irrigatingTimeStarted = true;
      return true;
    }
  }

  return false;
}

boolean mustIrrigate(int id, int value) {
  return (isIrrigatingTime(id) && value < minSensorValue[id]);
}

void initIrrigatingEvents (int lastIrrigatingEvents[][3], int numZones) {
    for (int i=0; i<numZones; i++) {
        lastIrrigatingEvents[i][ZONEID] = i;
        lastIrrigatingEvents[i][TIMESTAMP] = 0;
        lastIrrigatingEvents[i][DURATION] = 0;
    }
}

void loop() {
  static int checksDone = 0;
  static int sum[] = {0, 0};
  int means[] = {0, 0};
  int wateringDelays[] = {0, 0};
  int lastIrrigatingEvents[numZones][3];
  int delayTime = 0;
  int totalWateringDelay = 0;
  int sensorValues[numZones][numSensorTypes];

  initIrrigatingEvents(lastIrrigatingEvents, numZones);
  
  for (int i=0; i<numZones; i++) {
    sensorValues[i][SOIL_MOISTURE] = readSoilMoisture(i);
    sensorValues[i][AIR_TEMPERATURE] = readAirTemperature();
    sensorValues[i][AIR_HUMIDITY] =  readAirHumidity();
  }
  checksDone++;

  for (int i=0; i<numZones; i++) {
      sum[i] += sensorValues[i][SOIL_MOISTURE];
  }

  if (checksDone >= numChecksBeforeSending) {
    for (int i=0; i<numZones; i++) {
      means[i] = sum[i] / checksDone;
      sensorValues[i][SOIL_MOISTURE] = means[i];
    }

    checksDone = 0;
    for (int i=0; i<numZones; i++) {
      sum[i] = 0;
    }

    for (int i=0; i<numZones; i++) {
      if (mustIrrigate(i, means[i])) {
        DateTime now = OpenGarden.getTime();

        lastIrrigatingEvents[i][ZONEID] = i;
        lastIrrigatingEvents[i][TIMESTAMP] = now.unixtime();
        lastIrrigatingEvents[i][DURATION] = wateringTime[i];
      }
    }

    sendToSerial(sensorValues, lastIrrigatingEvents);

    for (int i=0; i<numZones; i++) {
      if (lastIrrigatingEvents[i][TIMESTAMP] > 0) { 
        wateringDelays[i] = doWatering(i);
      }
    }
  }   

  for (int i=0; i<numZones; i++) {
     totalWateringDelay += wateringDelays[i];
   }
 
   delayTime = checkingDelay - totalWateringDelay;
   if (delayTime > 0) {
     delay(delayTime);
   }
   else {
     delay(1000); // at least, to settle analog-digital converter
   }
}
