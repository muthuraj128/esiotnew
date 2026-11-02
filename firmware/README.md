# 🌴 ESP32 Tree Health Monitor (THM-0001) - Hardware & Firmware Guide

This directory contains the production C++ firmware for the **ESP32 Microcontroller** controlling a **DC Motor / Vibration Actuator** and a **Force Sensitive Resistor (FSR)**.

---

## 🔌 Hardware Circuit & Wiring Diagram

| ESP32 Pin | Component Pin | Description |
| :--- | :--- | :--- |
| **GPIO 18** | Motor Driver / Relay / Transistor Gate | **Motor Control Signal**: Turns ON for 30s during inspection |
| **GPIO 34** | FSR Signal Pin (Analog ADC1) | **FSR Force Sensor**: Connected with 10kΩ pull-down resistor to GND |
| **GPIO 2** | Onboard LED | Status & Test Active indicator LED |
| **GPIO 4** | Buzzer (+) | Warning buzzer triggered on UNHEALTHY result |
| **3V3 / 5V** | FSR VCC & Motor Power Supply | Power rail |
| **GND** | Sensor GND & Motor Driver GND | Common Ground |

---

## ⚙️ Operational Logic (30-Second Motor & FSR Scan)

1. On receiving command `devices/THM-0001/command` -> `START_TEST` (or typing `1` in Serial Monitor):
   - **Motor turns ON** on GPIO 18.
   - ESP32 opens a **30-Second Evaluation Window**.
   - ESP32 continuously reads the analog value from the FSR sensor on GPIO 34 (range 0 - 4095).
2. **Evaluation Criteria**:
   - If the FSR analog value increases **more than 1000** (`value > 1000`):
     - Tree is flagged as **UNHEALTHY (Tree Affected)**.
     - Exact timestamp and peak FSR value are recorded.
   - If the FSR value remains **<= 1000** throughout all 30 seconds:
     - Tree is flagged as **HEALTHY (Tree Healthy)**.
3. **After 30 Seconds**:
   - **Motor is turned OFF** (`digitalWrite(MOTOR_PIN, LOW)`).
   - If UNHEALTHY, warning buzzer sounds.
   - Result payload is published to `devices/THM-0001/result` and saved to database history.

---

## 🛠️ Required Arduino IDE Libraries

Before uploading the code, open Arduino IDE -> **Library Manager** (`Ctrl + Shift + I`):
1. Install **PubSubClient** by Nick O'Leary
2. Install **ArduinoJson** by Benoit Blanchon (v6 or v7)

---

## ⚡ Flashing Instructions

1. Connect your ESP32 board to your computer via USB cable.
2. Open `firmware/esp32_thm/esp32_thm.ino` in Arduino IDE.
3. Edit your WiFi credentials:
   ```cpp
   const char* WIFI_SSID     = "Your_WiFi_Name";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";
   ```
4. Select board: **ESP32 Dev Module** under `Tools -> Board -> ESP32 Arduino`.
5. Select your COM Port under `Tools -> Port`.
6. Click **Upload** (`Ctrl + U`).
7. Open **Serial Monitor** at `115200 baud`.
8. **Manual Pressure Simulation**: Type `1` in Serial Monitor anytime to simulate an FSR spike (> 1000) and verify the UNHEALTHY trigger, motor shutdown, and MQTT result reporting!
