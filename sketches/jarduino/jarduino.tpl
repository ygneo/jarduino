/*
 Two-entries moisture sensure and reactive watering prototype. 
 */
const int analogInPin1 = A0; // Analog input pin from moisture sensor #1
const int analogInPin2 = A2; // Analog input pin from moisture sensor #2

const int digitalOutPin[] = {2, 3}; // Rele-Electrovalve output

const int minSensorValue[] = $soilMoistureMinSensorValues; // Array of minimun values from the potentiometer to trigger watering

const int checkingDelay = 1000; // Delay in ms between checks  (for the analog-to-digital converter to settle after last reading)
const int numChecksBeforeSending = 3; // Number of checks should be done before sending data to serial
const int wateringTime[] = $wateringTimes; // Watering time in ms for every plant


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
  static int checksDone;
  static int sum[2];
  int sensorValue[2];
  int means[] = {0, 0};
  int wateringDelay[] = {0, 0};
  int delayTime = 0;
  
  sensorValue[0] = analogRead(analogInPin1);
  sensorValue[1] = analogRead(analogInPin2);
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
