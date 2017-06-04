/*
 Two-entries moisture sensure and reactive watering prototype. 
 */
const int analogInPin1 = A0; // Analog input pin from moisture sensor #1
const int analogInPin2 = A1; // Analog input pin from moisture sensor #2

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = $soilMoistureMinSensorValues; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 3; // Number of checks should be done before sending data to serial
const int wateringTime[] = $wateringTimes; // Watering time in ms for every plant


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


void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);

  pinMode(digitalOutPin[0], OUTPUT);
  pinMode(digitalOutPin[1], OUTPUT);

  digitalWrite(digitalOutPin[0], LOW);
  digitalWrite(digitalOutPin[1], LOW);
}

boolean mustWater(int id, int value) {
  return (value <= minSensorValue[id]);
}

int doWatering(int id) {
  digitalWrite(digitalOutPin[id], HIGH);
  delay(wateringTime[id]);
  digitalWrite(digitalOutPin[id], LOW);
  return wateringTime[id];
}

void loop() {
  static int checksDone = 0;
  static int sum[] = {0, 0};
  int sensorValue[] = {0, 0};
  int means[] = {0, 0};
  int wateringDelays[] = {0, 0};
  int delayTime = 0;
  int totalWateringDelay = 0;
  int numSensors = sizeof(sensorValue)/sizeof(int);

  int analogValues[] = {analogRead(analogInPin1), analogRead(analogInPin2)};
    
  sensorValue[0] = 1023 - analogValues[0];
  sensorValue[1] = 1023 - analogValues[1];
  checksDone++;
 
  sum[0] += sensorValue[0];
  sum[1] += sensorValue[1];

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
