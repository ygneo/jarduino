#include <OpenGarden.h>
#include "Wire.h" 

#define SOIL_MOISTURE     0
#define AIR_TEMPERATURE   1
#define AIR_HUMIDITY      2

const int numSensorTypes = 3;

const int numZones = 2;

const int analogInPins[] = {A0}; // Analog input pins

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = {50, 10}; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 1; // Number of checks should be done before sending data to serial
const long int wateringTime[] = {1000, 1000}; // Watering time in ms for every plant


void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);

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

    soilMoisture = OpenGarden.readSoilMoisture();
    soilMoisture = map(soilMoisture, 0, 1023, 1, 100);
    delay(500);

    OpenGarden.sensorPowerOFF();
  } else {
    soilMoisture = analogRead(analogInPins[sensor_id - 1]);
    soilMoisture = map(soilMoisture, 1023, 0, 1, 100);
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


void sendWateringEventsToSerial (int wateringDelays[]) 
{
  String valuesString;

  Serial.print("#actuators#");
  for (int i=0; i < numZones; i++) {
    if (wateringDelays[i]) {
      valuesString += i;
      valuesString += ",";
      valuesString += wateringDelays[i];
      valuesString += "#";   
    }
  }
  Serial.println(valuesString);  

}

void sendToSerial (int values[][numSensorTypes], int wateringDelays[]) {
  sendValuesToSerial(values);
  sendWateringEventsToSerial(wateringDelays);
}

boolean mustWater(int id, int value) {
  return (value <= minSensorValue[id]);
}

void loop() {
  static int checksDone = 0;
  static int sum[] = {0, 0};
  int means[] = {0, 0};
  int wateringDelays[] = {0, 0};
  int delayTime = 0;
  int totalWateringDelay = 0;
  int sensorValues[numZones][numSensorTypes];

  for (int i=0; i<numZones; i++) {
    sensorValues[i][SOIL_MOISTURE] = readSoilMoisture(i);
    sensorValues[i][AIR_TEMPERATURE] = readAirHumidity();
    sensorValues[i][AIR_HUMIDITY] =  readAirTemperature();
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
      if (mustWater(i, means[i])) {
        wateringDelays[i] = doWatering(i);
      }
    }

    sendToSerial(sensorValues, wateringDelays);
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
