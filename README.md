# 🌴 Smart Tree Health Monitoring System (THM)

A complete, end-to-end cloud and IoT product architecture designed for monitoring **coconut and palm tree health**. 

The system utilizes an **ESP32 microcontroller**, a **DC Motor / Vibration Actuator**, and a **Force Sensitive Resistor (FSR)** to evaluate tree structural status across the complete 8-tier product lifecycle:

> **Customer → Website → Express Backend → MQTT Broker → ESP32 (Motor ON + 30s FSR Sensing) → Motor OFF → Database → Website**

---


## 🏗️ System Architecture Overview

```text
                    CUSTOMER
                       │
                       ▼
              ┌─────────────────┐
              │  REACT WEBSITE  │ (Vite + Glassmorphism UI)
              │                 │
              │ Dashboard       │
              │ Check Now       │
              │ Schedules       │
              │ History Log     │
              └────────┬────────┘
                       │
                     HTTPS / SSE
                       │
                       ▼
              ┌─────────────────┐
              │ RENDER BACKEND  │ (Node.js + Express)
              │                 │
              │ REST API        │
              │ Scheduler Cron  │
              │ MQTT Controller │
              └───────┬─────────┘
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
       ┌──────────────┐  ┌──────────────┐
       │   SUPABASE   │  │ MQTT BROKER  │ (broker.hivemq.com)
       │ (PostgreSQL) │  │              │
       │ Customers    │  │ Commands     │
       │ Devices      │  │ Results      │
       │ Trees        │  │ Status       │
       │ Schedules    │  └──────┬───────┘
       │ History      │         │
       └──────────────┘         ▼
                          ┌─────────────┐
                          │    ESP32    │ (THM-0001)
                          │             │
                          │ Wi-Fi       │
                          │ MQTT        │
                          │ Motor (D18) │
                          │ FSR (ADC 34)│
                          └─────────────┘
```

---

## 🚀 Key Operational Logic

1. **Triggering `CHECK NOW`**:
   - Web UI sends POST `/api/check-now` to Express backend.
   - Backend publishes `START_TEST` to MQTT topic `devices/THM-0001/command`.
2. **ESP32 Motor & FSR Execution (30-Second Window)**:
   - ESP32 receives command and turns **ON the Motor** (`GPIO 18 = HIGH`).
   - ESP32 begins a **30-second observation & evaluation window**.
   - ESP32 continuously reads the analog output of the **FSR Sensor** on `GPIO 34`.
3. **Evaluation Threshold**:
   - If the FSR analog reading increases **more than 1000** (`FSR > 1000`):
     - The scan is evaluated as **UNHEALTHY (Tree Affected)**.
     - The peak FSR value and timestamp are recorded.
   - If the FSR analog value remains **<= 1000** throughout the full 30 seconds:
     - The scan is evaluated as **HEALTHY (Tree Healthy)**.
4. **Motor Shutdown & History Persistence**:
   - At the completion of 30 seconds, ESP32 **turns OFF the motor** (`GPIO 18 = LOW`).
   - If UNHEALTHY, warning buzzer sounds on `GPIO 4`.
   - ESP32 publishes result payload to `devices/THM-0001/result`.
   - Backend saves the record into database history and broadcasts it to the Web UI via Server-Sent Events (SSE).

---

## 📁 Repository Directory Structure

```text
ESIOT/
├── backend/
│   ├── src/
│   │   ├── config.js         # Configuration loader
│   │   ├── database.js       # Unified Supabase + Local DB layer
│   │   ├── mqttService.js    # MQTT client, commands & result subscribers
│   │   ├── scheduler.js      # Automated cron check scheduler
│   │   ├── virtualDevice.js  # Optional Virtual ESP32 simulator
│   │   ├── routes.js         # REST API & Server-Sent Events (SSE)
│   │   └── index.js          # Express entry point
│   ├── .env                  # Environment variables
│   ├── local_db.json         # Clean local JSON database
│   └── supabase_schema.sql   # Supabase SQL DDL script
├── frontend/
│   ├── src/
│   │   ├── components/       # StatusCard, LiveTestModal, HistoryTable, etc.
│   │   ├── App.jsx           # Main React App container
│   │   └── index.css         # Glassmorphism design system & styling
│   └── vite.config.js        # Vite build & Express proxy configuration
├── firmware/
│   └── esp32_thm/
│       ├── esp32_thm.ino     # Complete ESP32 Arduino C++ Motor & FSR firmware
│       └── README.md         # Circuit wiring table & Arduino IDE guide
├── package.json              # Root script runner
└── README.md                 # System documentation
```

---

## ⚡ Quick Start Guide (Running Locally)

### 1. Install & Launch
Run in terminal:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Run backend (Port 5000)
cd ../backend && npm start

# Run frontend (Port 5173) in a second terminal
cd ../frontend && npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 📡 MQTT Topic Protocol Specifications

| Direction | Topic Channel | Payload Format | Description |
| :--- | :--- | :--- | :--- |
| **Backend → ESP32** | `devices/THM-0001/command` | `{"action": "START_TEST", "check_type": "MANUAL"}` | Triggers 30-second scan window & turns ON motor |
| **ESP32 → Backend** | `devices/THM-0001/result` | `{"device_id": "THM-0001", "result": "UNHEALTHY", "detected": true, "detection_time": 12.4, "fsr_value": 1380, "duration": 30.0}` | Result payload published after motor is turned OFF |
| **ESP32 → Backend** | `devices/THM-0001/status` | `{"device_id": "THM-0001", "online": true, "motor_status": "OFF", "fsr_baseline": 220}` | Periodic heartbeat (every 10s) |
