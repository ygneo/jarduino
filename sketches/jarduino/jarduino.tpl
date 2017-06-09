/*
 Two-entries moisture sensure and reactive watering prototype. 
 */
const int analogInPins[] = {A0, A1}; // Analog input pins

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = $soilMoistureMinSensorValues; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 3; // Number of checks should be done before sending data to serial
const int wateringTime[] = $wateringTimes; // Watering time in ms for every plant


void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);

  pinMode(digitalOutPin[0], OUTPUT);
  pinMode(digitalOutPin[1], OUTPUT);

  digitalWrite(digitalOutPin[0], LOW);
  digitalWrite(digitalOutPin[1], LOW);
}

int doWatering(int id) {
  digitalWrite(digitalOutPin[id], HIGH);
  delay(wateringTime[id]);
  digitalWrite(digitalOutPin[id], LOW);
  return wateringTime[id];
}

int readSoilMoisture(int sensor_id) {
  return 1023 - analogRead(analogInPins[sensor_id]);
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
  
  Serial.print("\n");
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
  int sensorValue[] = {0, 0};
  int means[] = {0, 0};
  int wateringDelays[] = {0, 0};
  int delayTime = 0;
  int totalWateringDelay = 0;
  int sensorValues[] = {0, 0};
  int numSensors = sizeof(sensorValue)/sizeof(int);

  for (int i=0; i<numSensors; i++) {
    sensorValue[i] = readSoilMoisture(i);
  }
  checksDone++;

  for (int i=0; i<numSensors; i++) {
      sum[i] += sensorValue[i];
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
