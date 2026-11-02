import mqtt from 'mqtt';
import { config } from './config.js';

let simulatorClient = null;
let isSimulatorActive = false; // Disabled by default to ensure 100% real hardware data
let simulateUnhealthyNext = false;
let heartbeatInterval = null;
let activeTestTimeout = null;

export function initVirtualDevice() {
  console.log('🤖 Virtual ESP32 Hardware Simulator ready (Disabled by default for real hardware mode).');

  simulatorClient = mqtt.connect(config.mqttBrokerUrl, {
    clientId: 'thm_virtual_esp32_' + Math.random().toString(16).substring(2, 6),
    clean: true
  });

  simulatorClient.on('connect', () => {
    const commandTopic = `devices/${config.deviceId}/command`;
    simulatorClient.subscribe(commandTopic);
    startHeartbeat();
  });

  simulatorClient.on('message', (topic, payload) => {
    if (!isSimulatorActive) return;

    try {
      const msg = JSON.parse(payload.toString());
      if (msg.action === 'START_TEST' || msg.raw === 'START_TEST') {
        run30SecondTest(msg.check_type || 'MANUAL');
      }
    } catch {
      if (payload.toString() === 'START_TEST') {
        run30SecondTest('MANUAL');
      }
    }
  });
}

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  
  heartbeatInterval = setInterval(() => {
    if (isSimulatorActive) sendHeartbeat();
  }, 10000);
}

function sendHeartbeat() {
  if (!simulatorClient || !simulatorClient.connected) return;
  
  const statusTopic = `devices/${config.deviceId}/status`;
  const payload = JSON.stringify({
    device_id: config.deviceId,
    online: true,
    mode: 'VIRTUAL_SIMULATOR',
    rssi: -58,
    battery: 100,
    firmware: 'v2.0.0-FSR-SIM',
    motor_status: activeTestTimeout ? 'ON' : 'OFF',
    fsr_baseline: 240
  });
  
  simulatorClient.publish(statusTopic, payload);
}

function run30SecondTest(checkType) {
  if (!isSimulatorActive) return;

  const isUnhealthy = simulateUnhealthyNext;
  simulateUnhealthyNext = false;

  if (activeTestTimeout) clearTimeout(activeTestTimeout);

  console.log('🤖 [Virtual ESP32] Motor ON. Evaluating FSR for 30 seconds...');

  // The test runs for 30 seconds with motor on. At the end of 30 seconds, motor turns off and result is published.
  activeTestTimeout = setTimeout(() => {
    activeTestTimeout = null;
    console.log('🤖 [Virtual ESP32] 30 seconds completed. Motor OFF.');

    if (isUnhealthy) {
      const peakFsr = 1380;
      publishResult({
        device_id: config.deviceId,
        check_type: checkType,
        result: 'UNHEALTHY',
        detected: true,
        detection_time: 14.2,
        fsr_value: peakFsr,
        duration: 30.0,
        started_at: new Date(Date.now() - 30000).toISOString(),
        notes: `FSR value exceeded threshold (> 1000). Peak FSR: ${peakFsr} detected. Motor turned off after 30s.`
      });
    } else {
      const peakFsr = 430;
      publishResult({
        device_id: config.deviceId,
        check_type: checkType,
        result: 'HEALTHY',
        detected: false,
        detection_time: 30.0,
        fsr_value: peakFsr,
        duration: 30.0,
        started_at: new Date(Date.now() - 30000).toISOString(),
        notes: `Clean 30s evaluation completed. FSR value remained <= 1000 (Peak: ${peakFsr}). Motor turned off.`
      });
    }
  }, 30000);
}

function publishResult(resultObj) {
  if (!simulatorClient || !simulatorClient.connected) return;

  const resultTopic = `devices/${config.deviceId}/result`;
  const payload = JSON.stringify(resultObj);
  
  simulatorClient.publish(resultTopic, payload, { qos: 1 });
}

export function setSimulatorConfig({ active, forceUnhealthy }) {
  if (active !== undefined) {
    isSimulatorActive = active;
    if (active) sendHeartbeat();
  }
  if (forceUnhealthy !== undefined) simulateUnhealthyNext = forceUnhealthy;
  return { isSimulatorActive, simulateUnhealthyNext };
}
