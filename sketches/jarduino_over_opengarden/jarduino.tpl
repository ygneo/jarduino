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

const int numZones = $numZones;

const int sensorsIn[] = $sensorsIns; // For instance {99, A0} (open garden MOIST, A0)
const int electroValvesOut[] = $electroOuts; // For instance {991, 992} (open garden electro 1 & 2)

const int minSoilMoisture[numZones] = $soilMoistureMinSensorValues;
const int minAirHumidity[numZones] = $airHumidityMinSensorValues;
const int maxAirTemperature[numZones] = $airTemperatureMaxSensorValues;

const int checkingDelay = $checkingDelay;
const int numChecksBeforeSending = $numChecksBeforeSending; // Number of checks should be done before sending data to serial

DateTime irrigatingStartDateTime[] = $irrigatingStartDateTimes; // For instance {DateTime(2017, 6, 22, 13, 10, 0), DateTime(2017, 6, 22, 13, 35, 0)}
const long int wateringTime[] = $wateringTimes; // Watering time in ms for every plant
const long int irrigatingFrequence[] = $irrigatingFrequences; // Irrigating frequence in seconds for every plant

static uint32_t lastIrrigatingTimestamp[numZones];


void emptyLastIrrigatingTimestamp() {
  for (int i=0; i<numZones; i++) {
    lastIrrigatingTimestamp[i] = 0;
  }
}

void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);

  OpenGarden.initRTC();

  OpenGarden.initIrrigation(1);
  OpenGarden.initIrrigation(2);

  OpenGarden.irrigationOFF(1);
  OpenGarden.irrigationOFF(2);

  OpenGarden.initSensors();

  emptyLastIrrigatingTimestamp();
}

int doWatering(int zoneId) {
  int outId = electroValvesOut[zoneId];

  if (outId > 990) {
    outId = outId - 990;
  }

  OpenGarden.irrigationON(outId);

  delay(wateringTime[zoneId]);

  OpenGarden.irrigationOFF(outId);

  return wateringTime[zoneId];
}

int readSoilMoisture(int zoneId) {
  int soilMoisture = 0;
  int inId = sensorsIn[zoneId];

  if (inId == 99) {
    OpenGarden.sensorPowerON();
    delay(500);
    soilMoisture = OpenGarden.readSoilMoisture();
    soilMoisture = map(soilMoisture, 0, 1023, 0, 100);
    OpenGarden.sensorPowerOFF();
  } else {
    soilMoisture = analogRead(inId);
    soilMoisture = map(soilMoisture, 1023, 0, 0, 100);
  }

  return soilMoisture;
}

/* ---- */

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


void sendIrrigatingEventsToSerial (uint32_t irrigatingEvents[][3]) 
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

void sendToSerial (int values[][numSensorTypes], uint32_t lastIrrigatingEvents[][3]) {
  DateTime now = OpenGarden.getTime();

  Serial.print("#time#");
  Serial.print(now.unixtime());
  Serial.print("#");
  sendValuesToSerial(values);
  sendIrrigatingEventsToSerial(lastIrrigatingEvents);
}

boolean isIrrigatingTime(int id) {
  DateTime now = OpenGarden.getTime();
  uint32_t currentTimestamp = now.unixtime();
  uint32_t diff;
  
  if (now.unixtime() >= irrigatingStartDateTime[id].unixtime()) {
    if (lastIrrigatingTimestamp[id] == 0) {
      lastIrrigatingTimestamp[id] = currentTimestamp;
      return true;
    } else {
      diff = currentTimestamp - lastIrrigatingTimestamp[id];
      if (diff >= irrigatingFrequence[id]) {
        lastIrrigatingTimestamp[id] = currentTimestamp;
        return true;
      }
    }
  }

  return false;
}

boolean thresholdOvercomed(int sensorValues[], int id) {
  return (sensorValues[SOIL_MOISTURE] <= minSoilMoisture[id] || sensorValues[AIR_HUMIDITY] <= minAirHumidity[id] || sensorValues[AIR_TEMPERATURE] >= maxAirTemperature[id]);
}

boolean mustIrrigate(int id, int sensorValues[]) {
  return (isIrrigatingTime(id) && thresholdOvercomed(sensorValues, id));
}

void initIrrigatingEvents (uint32_t lastIrrigatingEvents[][3], int numZones) {
    for (int i=0; i<numZones; i++) {
        lastIrrigatingEvents[i][ZONEID] = i;
        lastIrrigatingEvents[i][TIMESTAMP] = 0;
        lastIrrigatingEvents[i][DURATION] = 0;
    }
}

void readSensorValues(int id, int sensorValues[][numSensorTypes]) {
  OpenGarden.sensorPowerON();
  delay(1000);
  float airHumidity = OpenGarden.readAirHumidity();
  float airTemperature = OpenGarden.readAirTemperature();
  OpenGarden.sensorPowerOFF();

  sensorValues[id][SOIL_MOISTURE] = readSoilMoisture(id);
  sensorValues[id][AIR_TEMPERATURE] = airTemperature;
  sensorValues[id][AIR_HUMIDITY] =  airHumidity;
}

void loop() {
  static int checksDone = 0;
  static int sumSoilMoisture[] = {0, 0};
  static int sumAirHumidity[] = {0, 0};
  static int sumAirTemperature[] = {0, 0};
  int means[] = {0, 0};
  int wateringDelays[] = {0, 0};
  uint32_t lastIrrigatingEvents[numZones][3];
  int delayTime = 0;
  int totalWateringDelay = 0;
  int sensorValues[numZones][numSensorTypes];

  initIrrigatingEvents(lastIrrigatingEvents, numZones);
  
  for (int i=0; i<numZones; i++) {
    readSensorValues(i, sensorValues);
  }
  checksDone++;

  for (int i=0; i<numZones; i++) {
      sumSoilMoisture[i] += sensorValues[i][SOIL_MOISTURE];
  }
  for (int i=0; i<numZones; i++) {
      sumAirHumidity[i] += sensorValues[i][AIR_HUMIDITY];
  }
  for (int i=0; i<numZones; i++) {
      sumAirTemperature[i] += sensorValues[i][AIR_TEMPERATURE];
  }

  if (checksDone >= numChecksBeforeSending) {
    for (int i=0; i<numZones; i++) {
      means[i] = sumSoilMoisture[i] / checksDone;
      sensorValues[i][SOIL_MOISTURE] = means[i];

      means[i] = sumAirHumidity[i] / checksDone;
      sensorValues[i][AIR_HUMIDITY] = means[i];

      means[i] = sumAirTemperature[i] / checksDone;
      sensorValues[i][AIR_TEMPERATURE] = means[i];
    }

    checksDone = 0;
    for (int i=0; i<numZones; i++) {
      sumSoilMoisture[i] = 0;
      sumAirHumidity[i] = 0;
      sumAirTemperature[i] = 0;
    }

    for (int i=0; i<numZones; i++) {
      if (mustIrrigate(i, sensorValues[i])) {
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
