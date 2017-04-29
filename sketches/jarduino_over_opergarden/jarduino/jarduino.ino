#include <OpenGarden.h>
#include "Wire.h" 

const int analogInPin1 = A0; // Analog input pin from moisture sensor #1
const int analogInPin2 = A2; // Analog input pin from moisture sensor #2

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = {200,1024}; // Minimun value from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 3; // Number of checks should be done before sending data to serial
const int wateringTime[] = {200, 300}; // Watering time in ms for every plant

void sendToSerial (int id, int value)
{
  Serial.print("#");
  Serial.print(id + 1);
  if (value == -1) {
    Serial.println("#w#");
  }
  else {
    Serial.print("#");
    Serial.print(value);
    Serial.print("#");
    Serial.print("\n");
  }
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
  return (value >= minSensorValue[id]);
}

int doWatering(int id) {
  int valve_number = id + 1;
  OpenGarden.irrigationON(valve_number);
  sendToSerial(id, -1);
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
  int mean[] = {0, 0};
  int wateringDelay[] = {0, 0};
  int delayTime = 0;
  
  sensorValue[0] = readSoilMoisture(1);
  sensorValue[1] = 0;
  //  sensorValue[1] = analogRead(analogInPin2);
  checksDone++;
 
  sum[0] += sensorValue[0];
  sum[1] += sensorValue[1];
  if (checksDone >= numChecksBeforeSending) {
    mean[0] = sum[0] / checksDone;
    mean[1] = sum[1] / checksDone;
    sendToSerial(0, mean[0]);
    sendToSerial(1, mean[1]);
    checksDone = 0;
    sum[0] = 0;
    sum[1] = 0;
    if (mustWater(0, mean[0])) {
      wateringDelay[0] = doWatering(0);
    }
    if (mustWater(1, mean[1])) {
      wateringDelay[1] = doWatering(1);
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
