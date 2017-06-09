#include <OpenGarden.h>
#include "Wire.h" 

const int analogInPins[] = {A0}; // Analog input pins

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = {150, 750}; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 3; // Number of checks should be done before sending data to serial
const int wateringTime[] = {1000, 1000}; // Watering time in ms for every plant


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
    OpenGarden.sensorPowerON(); // Turns on the sensor power supply

    soilMoisture = OpenGarden.readSoilMoisture(); //Read the sensor

    delay(500); // Time for initializing the sensor

    OpenGarden.sensorPowerOFF(); //Turns off the sensor power supply
  } else {
    soilMoisture = 1023 - analogRead(analogInPins[sensor_id - 1]);
  }
    
  return soilMoisture;
}

/* ---- */

void sendValuesToSerial (int values[], int size)
{
  Serial.print("#sensors#");
  
  for (int i=0; i<size; i++) {
    String valuesString;
    
    valuesString += i;
    valuesString += ",";
    valuesString += values[i];
    valuesString += "#";   
    Serial.print(valuesString);  
  }
}


void sendWateringEventsToSerial (int wateringDelays[], int size) 
{
  String valuesString;

  Serial.print("#actuators#");
  for (int i=0; i<size; i++) {
    if (wateringDelays[i]) {
      valuesString += i;
      valuesString += ",";
      valuesString += wateringDelays[i];
      valuesString += "#";   
    }
  }
  Serial.println(valuesString);  

}

void sendToSerial (int values[], int wateringDelays[], int size) {
  sendValuesToSerial(values, size);
  sendWateringEventsToSerial(wateringDelays, size);
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
  int sensorValues[] = {0, 0};
  int numSensors = sizeof(sensorValues)/sizeof(int);

  for (int i=0; i<numSensors; i++) {
    sensorValues[i] = readSoilMoisture(i);
  }
  checksDone++;

  for (int i=0; i<numSensors; i++) {
      sum[i] += sensorValues[i];
  }

  if (checksDone >= numChecksBeforeSending) {
    means[0] = sum[0] / checksDone;
    means[1] = sum[1] / checksDone;

    checksDone = 0;
    sum[0] = 0;
    sum[1] = 0;

    for (int i=0; i<numSensors; i++) {
      if (mustWater(i, means[i])) {
        wateringDelays[i] = doWatering(i);
      }
    }

    sendToSerial(means, wateringDelays, numSensors);
  }   

  for (int i=0; i<numSensors; i++) {
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
