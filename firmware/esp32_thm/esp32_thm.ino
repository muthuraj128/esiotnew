/*
  ===================================================================
  🌴 TREE HEALTH MONITORING SYSTEM (THM-0001) - ESP32 FIRMWARE 🌴
  ===================================================================
  
  Operational Protocol:
  1. ESP32 connects to WiFi and MQTT Broker (broker.hivemq.com).
  2. Subscribes to: devices/THM-0001/command
  3. Publishes heartbeat to: devices/THM-0001/status (every 10s)
  4. On receiving "START_TEST" command (or typing '1' in Serial Monitor):
     - Turns ON the Motor (MOTOR_PIN = GPIO 18).
     - Starts a 30-Second Observation & Evaluation Window.
     - Continuously samples FSR (Force Sensitive Resistor on GPIO 34).
     - IF FSR analog value increases more than 1000 (value > 1000):
         Flagged as UNHEALTHY (Tree Affected).
     - At the end of the 30-second window:
         - Turns OFF the Motor (MOTOR_PIN = LOW).
         - IF FSR exceeded 1000:
             Result = UNHEALTHY (detected = true, peak FSR value recorded)
             Sounds warning buzzer.
         - IF FSR remained <= 1000 throughout 30 seconds:
             Result = HEALTHY (detected = false, duration = 30.0s)
         - Publishes comprehensive result payload to MQTT.
  
  Hardware Connections:
  - GPIO 18: Motor Control (to Transistor / MOSFET Gate / Relay IN)
  - GPIO 34: FSR Sensor Analog Input (ADC1_CH6 with 10k pull-down to GND)
  - GPIO 2:  Onboard Status LED
  - GPIO 4:  Warning Buzzer (+)
  
  Required Libraries in Arduino IDE:
  - PubSubClient (by Nick O'Leary)
  - ArduinoJson (by Benoit Blanchon - v6 or v7)
  ===================================================================
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==========================================
// 1. CONFIGURATION & PIN DEFINITIONS
// ==========================================
const char* WIFI_SSID     = "esiot";
const char* WIFI_PASSWORD = "12345678";

const char* MQTT_BROKER   = "broker.hivemq.com";
const int   MQTT_PORT     = 1883;

const char* DEVICE_ID     = "THM-0001";
const char* TOPIC_COMMAND = "devices/THM-0001/command";
const char* TOPIC_RESULT  = "devices/THM-0001/result";
const char* TOPIC_STATUS  = "devices/THM-0001/status";

// Pin Configuration
const int MOTOR_PIN       = 25; // Motor Driver Control Pin
const int FSR_PIN         = 34; // FSR Analog Input (ADC1 Channel 6)
const int STATUS_LED_PIN  = 2;  // Onboard Status LED
const int BUZZER_PIN      = 4;  // Warning buzzer pin

// FSR Evaluation Threshold & Observation Window
const int FSR_THRESHOLD                  = 1000;  // Threshold: value > 1000 -> UNHEALTHY
const unsigned long OBSERVATION_WINDOW_MS = 30000; // 30 Seconds Evaluation Window
const unsigned long HEARTBEAT_INTERVAL_MS = 10000; // 10 Seconds Heartbeat

// ==========================================
// 2. GLOBAL VARIABLES & STATE MACHINE
// ==========================================
WiFiClient espClient;
PubSubClient mqtt(espClient);

enum SystemState {
  STATE_IDLE,
  STATE_TESTING
};

SystemState currentState = STATE_IDLE;

unsigned long testStartTime = 0;
unsigned long lastHeartbeatTime = 0;
unsigned long lastLogTime = 0;

int peakFsrValue = 0;
bool thresholdExceeded = false;
float firstExceededTimeSec = 0.0;
String currentCheckType = "MANUAL";

// ==========================================
// 3. FORWARD DECLARATIONS
// ==========================================
void connectWiFi();
void connectMQTT();
void sendHeartbeat();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void startTest(String checkType);
void stopTestAndPublishResult(bool detected, float detectionTimeSec, int peakFsr);

// ==========================================
// 4. SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n==============================================");
  Serial.println("🌴 ESP32 Tree Health Monitor (THM-0001)");
  Serial.println("⚙️ Motor & FSR Sensor Protocol (v2.0.0)");
  Serial.println("==============================================");
  Serial.println("Pin Config:");
  Serial.printf(" - Motor Control: GPIO %d\n", MOTOR_PIN);
  Serial.printf(" - FSR Analog In: GPIO %d (ADC1)\n", FSR_PIN);
  Serial.printf(" - Status LED:    GPIO %d\n", STATUS_LED_PIN);
  Serial.printf(" - Buzzer Pin:    GPIO %d\n", BUZZER_PIN);
  Serial.printf(" - FSR Threshold: > %d -> UNHEALTHY\n", FSR_THRESHOLD);
  Serial.println("💡 TIP: Type '1' in Serial Monitor anytime to trigger a test / simulate FSR > 1000!");
  Serial.println("==============================================");

  // Initialize Pins
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Set default states: Motor OFF, LED OFF, Buzzer OFF
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Connect to Network
  connectWiFi();

  // Configure MQTT
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);

  connectMQTT();
}

// ==========================================
// 5. MAIN LOOP
// ==========================================
void loop() {
  // Maintain WiFi & MQTT connection
  if (!mqtt.connected()) {
    connectMQTT();
  }
  mqtt.loop();

  unsigned long currentMillis = millis();

  // --- STATE 1: IDLE ---
  if (currentState == STATE_IDLE) {
    // Soft idle heartbeat blink
    digitalWrite(STATUS_LED_PIN, (currentMillis / 1000) % 2 == 0 ? HIGH : LOW);
    digitalWrite(MOTOR_PIN, LOW); // Guarantee motor is OFF in idle

    if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
      lastHeartbeatTime = currentMillis;
      sendHeartbeat();
    }

    // Allow typing '1' in Serial Monitor while idle to initiate a test with simulated pressure
    if (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '1') {
        Serial.println("\n🔴 Serial input '1' received: Starting test with simulated FSR > 1000!");
        startTest("SERIAL_TRIGGER");
        // Force simulated reading above 1000
        peakFsrValue = 1420;
        thresholdExceeded = true;
        firstExceededTimeSec = 2.5;
      }
    }
  }

  // --- STATE 2: 30-SECOND TEST EVALUATION WINDOW ---
  else if (currentState == STATE_TESTING) {
    // Fast flash status LED while test is active
    digitalWrite(STATUS_LED_PIN, (currentMillis / 100) % 2 == 0 ? HIGH : LOW);

    unsigned long elapsedTimeMs = currentMillis - testStartTime;
    float elapsedTimeSec = elapsedTimeMs / 1000.0;

    // Read real FSR analog value (0 - 4095 on ESP32)
    int currentFsr = analogRead(FSR_PIN);

    // Allow user to simulate high pressure by typing '1' in Serial Monitor during active scan
    if (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '1') {
        currentFsr = 1580; // Simulated value > 1000
        Serial.println("\n🔴 Serial input '1' received: Simulating FSR pressure spike (1580)!");
      }
    }

    // Track peak value
    if (currentFsr > peakFsrValue) {
      peakFsrValue = currentFsr;
    }

    // Evaluate threshold condition
    if (currentFsr > FSR_THRESHOLD && !thresholdExceeded) {
      thresholdExceeded = true;
      firstExceededTimeSec = elapsedTimeSec;
      Serial.println("\n⚠️ WARNING: FSR value exceeded threshold (> 1000)!");
      Serial.printf("   Current FSR: %d | Time: %.2f sec\n", currentFsr, firstExceededTimeSec);
    }

    // Print live telemetry to Serial Monitor every 1 second
    if (currentMillis - lastLogTime >= 1000) {
      lastLogTime = currentMillis;
      Serial.printf("⏱️ [Test Running: %04.1fs / 30.0s] Motor: ON | FSR Value: %4d | Peak: %4d | Status: %s\n",
                    elapsedTimeSec,
                    currentFsr,
                    peakFsrValue,
                    thresholdExceeded ? "UNHEALTHY (Flagged)" : "HEALTHY (Normal)");
    }

    // Check if 30-Second observation window has completed
    if (elapsedTimeMs >= OBSERVATION_WINDOW_MS) {
      Serial.println("\n==============================================");
      Serial.println("🏁 30-SECOND OBSERVATION WINDOW COMPLETED!");
      Serial.println("🛑 TURNING OFF MOTOR...");
      
      // Turn OFF Motor immediately
      digitalWrite(MOTOR_PIN, LOW);

      if (thresholdExceeded) {
        Serial.printf("🔴 RESULT: UNHEALTHY (Tree Affected). Peak FSR: %d exceeded threshold (> %d) at %.2fs\n",
                      peakFsrValue, FSR_THRESHOLD, firstExceededTimeSec);
        
        // Sound warning buzzer on unhealthy result
        digitalWrite(BUZZER_PIN, HIGH);
        delay(400);
        digitalWrite(BUZZER_PIN, LOW);

        stopTestAndPublishResult(true, firstExceededTimeSec, peakFsrValue);
      } else {
        Serial.printf("🟢 RESULT: HEALTHY (Tree Healthy). All readings remained normal (Peak: %d <= %d)\n",
                      peakFsrValue, FSR_THRESHOLD);
        stopTestAndPublishResult(false, 30.0, peakFsrValue);
      }
    }
  }

  delay(20); // Small loop yield for stability
}

// ==========================================
// 6. HELPER FUNCTIONS
// ==========================================
void connectWiFi() {
  Serial.print("Connecting to WiFi SSID: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
    delay(400);
    Serial.print(".");
  }

  digitalWrite(STATUS_LED_PIN, HIGH);
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(MQTT_BROKER);
    Serial.print("...");

    String clientId = "ESP32_THM_";
    clientId += String(random(0xffff), HEX);

    if (mqtt.connect(clientId.c_str())) {
      Serial.println("\n✅ MQTT Connected!");
      mqtt.subscribe(TOPIC_COMMAND);
      Serial.print("📡 Subscribed to: ");
      Serial.println(TOPIC_COMMAND);
      sendHeartbeat();
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" Trying again in 5 seconds...");
      delay(5000);
    }
  }
}

void sendHeartbeat() {
  StaticJsonDocument<256> doc;
  doc["device_id"]    = DEVICE_ID;
  doc["online"]       = true;
  doc["rssi"]         = WiFi.RSSI();
  doc["firmware"]     = "v2.0.0-FSR";
  doc["motor_status"] = (currentState == STATE_TESTING) ? "ON" : "OFF";
  doc["fsr_baseline"] = analogRead(FSR_PIN);

  char buffer[300];
  serializeJson(doc, buffer);

  mqtt.publish(TOPIC_STATUS, buffer);
  Serial.print("📤 Heartbeat Published: ");
  Serial.println(buffer);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("📩 MQTT Message Received on ");
  Serial.print(topic);
  Serial.print(": ");
  Serial.println(message);

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  String action = "";
  String checkType = "MANUAL";

  if (!error) {
    action = doc["action"].as<String>();
    if (doc.containsKey("check_type")) {
      checkType = doc["check_type"].as<String>();
    }
  } else {
    // Fallback if plain text "START_TEST" is sent
    if (message.equalsIgnoreCase("START_TEST")) {
      action = "START_TEST";
    }
  }

  if (action.equalsIgnoreCase("START_TEST")) {
    startTest(checkType);
  }
}

void startTest(String checkType) {
  Serial.println("\n==============================================");
  Serial.printf("🚀 STARTING 30-SECOND MOTOR & FSR TEST SCAN [%s]\n", checkType.c_str());
  Serial.println("⚡ TURNING ON MOTOR (GPIO 18)...");
  Serial.printf("📊 SENSING: FSR Analog Pin (GPIO 34) Threshold = %d\n", FSR_THRESHOLD);
  Serial.println("==============================================");

  // Turn ON Motor
  digitalWrite(MOTOR_PIN, HIGH);
  digitalWrite(STATUS_LED_PIN, HIGH);

  currentState = STATE_TESTING;
  testStartTime = millis();
  lastLogTime = millis();
  currentCheckType = checkType;
  peakFsrValue = 0;
  thresholdExceeded = false;
  firstExceededTimeSec = 0.0;
}

void stopTestAndPublishResult(bool detected, float detectionTimeSec, int peakFsr) {
  // Always guarantee motor is turned OFF
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, HIGH);
  currentState = STATE_IDLE;

  StaticJsonDocument<350> doc;
  doc["device_id"]      = DEVICE_ID;
  doc["check_type"]     = currentCheckType;
  doc["result"]         = detected ? "UNHEALTHY" : "HEALTHY";
  doc["detected"]       = detected;
  doc["detection_time"] = round(detectionTimeSec * 100.0) / 100.0;
  doc["fsr_value"]      = peakFsr;
  doc["duration"]       = 30.0;
  
  if (detected) {
    doc["notes"] = "FSR value exceeded threshold (> 1000). Peak: " + String(peakFsr) + " at " + String(detectionTimeSec, 1) + "s. Motor stopped.";
  } else {
    doc["notes"] = "Clean 30s evaluation completed. FSR value remained <= 1000. Peak: " + String(peakFsr) + ". Motor stopped.";
  }

  char buffer[400];
  serializeJson(doc, buffer);

  mqtt.publish(TOPIC_RESULT, buffer, true);

  Serial.println("\n==============================================");
  Serial.print("📤 TEST RESULT PUBLISHED TO MQTT: ");
  Serial.println(buffer);
  Serial.println("==============================================\n");
}
