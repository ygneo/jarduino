#include <OpenGarden.h>
#include "Wire.h" 

const int analogInPin1 = A0; // Analog input pin from moisture sensor #1
const int analogInPin2 = A2; // Analog input pin from moisture sensor #2

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = {1000, 200}; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 1; // Number of checks should be done before sending data to serial
const int wateringTime[] = {1000, 2000}; // Watering time in ms for every plant


void sendValuesToSerial (int values[])
{
  Serial.print("#sensors#");
  
  for (unsigned int i=0; i<sizeof(values); i++) {
    String valuesString;
    
    valuesString += i;
    valuesString += ",";
    valuesString += values[i];
    valuesString += "#";   
    Serial.print(valuesString);  
  }
  
  Serial.print("\n");
}

void sendWateringEventToSerial (int id) 
{
  String valuesString;

  Serial.print("#");
  Serial.print("actuators");
  Serial.print("#");
  valuesString += id;
  valuesString += ",w#";   
  Serial.print(valuesString);  
  Serial.print("\n");
}

void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);

  OpenGarden.initIrrigation(1);
  OpenGarden.initIrrigation(2);

  OpenGarden.irrigationOFF(1);
  OpenGarden.irrigationOFF(2);

  OpenGarden.initSensors();
}

boolean mustWater(int id, int value) {
  return (value <= minSensorValue[id]);
}

int doWatering(int id) {
  int valve_number = id + 1;

  OpenGarden.irrigationON(valve_number);

  delay(wateringTime[id]);

  OpenGarden.irrigationOFF(valve_number);

  return wateringTime[id];
}

int readSoilMoisture(int sensor_id) {
  OpenGarden.sensorPowerON(); //Turns on the sensor power supply
  
  delay(500); // Time for initializing the sensor
  
  int soilMoisture = OpenGarden.readSoilMoisture(); //Read the sensor
  
  OpenGarden.sensorPowerOFF(); //Turns off the sensor power supply

  return soilMoisture;
}


void loop() {
  static int checksDone;
  static int sum[2];
  int sensorValue[2];
  int means[] = {0, 0};
  int wateringDelay[] = {0, 0};
  int delayTime = 0;
  
  sensorValue[0] = readSoilMoisture(1);
  sensorValue[1] = 0;
  checksDone++;
 
  sum[0] += sensorValue[0];
  sum[1] += sensorValue[1];
  if (checksDone >= numChecksBeforeSending) {
    means[0] = sum[0] / checksDone;
    means[1] = sum[1] / checksDone;

    sendValuesToSerial(means);
   
    checksDone = 0;
    sum[0] = 0;
    sum[1] = 0;
   
    if (mustWater(0, means[0])) {
      wateringDelay[0] = doWatering(0);
      sendWateringEventToSerial(0);
    }
    
    if (mustWater(1, means[1])) {
      wateringDelay[1] = doWatering(1);
      sendWateringEventToSerial(1);
    }
  }   
 
  delayTime = checkingDelay - (wateringDelay[0] + wateringDelay[1]);
  if (delayTime > 0) {
    delay(delayTime);
  }
  else {
    delay(1000); // at least, to settle analog-digital converter
  }
}
