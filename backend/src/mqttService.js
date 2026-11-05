import mqtt from 'mqtt';
import { config } from './config.js';
import { updateDeviceStatus, addHistoryRecord } from './database.js';

let mqttClient = null;
const eventListeners = new Set();

// Track whether a CHECK NOW test is currently expected
let isTestExpected = false;
let testExpectedTimer = null;

export function initMqtt(onResultCallback, onStatusCallback) {
  console.log(`🔌 Connecting to MQTT Broker at ${config.mqttBrokerUrl}...`);
  
  mqttClient = mqtt.connect(config.mqttBrokerUrl, {
    clientId: 'thm_backend_' + Math.random().toString(16).substring(2, 8),
    clean: true,
    reconnectPeriod: 3000,
  });

  mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT Broker!');
    
    const statusTopic = `devices/${config.deviceId}/status`;
    const resultTopic = `devices/${config.deviceId}/result`;
    
    // Clear any stale retained result message on the public broker so it does not ghost-trigger
    mqttClient.publish(resultTopic, '', { retain: true, qos: 1 });
    
    mqttClient.subscribe([statusTopic, resultTopic], (err) => {
      if (err) {
        console.error('❌ MQTT Subscription Error:', err.message);
      } else {
        console.log(`📡 Subscribed to MQTT Topics:\n  - ${statusTopic}\n  - ${resultTopic}`);
      }
    });
  });

  mqttClient.on('message', async (topic, payload, packet) => {
    try {
      // 1. REJECT RETAINED (OLD/STALE) MESSAGES CACHED BY PUBLIC BROKER
      if (packet && packet.retain) {
        console.log(`⚠️ Ignored stale retained MQTT message on [${topic}]`);
        return;
      }

      const messageStr = payload.toString().trim();
      if (!messageStr) return; // Ignore empty payloads (such as retain-clearing messages)

      let data = {};
      try {
        data = JSON.parse(messageStr);
      } catch {
        data = { raw: messageStr };
      }

      console.log(`📩 MQTT Message Received [${topic}]:`, data);

      if (topic.endsWith('/status')) {
        // Heartbeat status from ESP32
        const updatedDev = await updateDeviceStatus(config.deviceId, {
          status: 'ONLINE',
          battery_level: data.battery !== undefined ? data.battery : (data.online ? 100 : null),
          signal_strength: data.rssi !== undefined ? data.rssi : null,
          firmware_version: data.firmware || 'v2.0.0-FSR',
          live_fsr: data.fsr_baseline !== undefined ? data.fsr_baseline : (data.fsr !== undefined ? data.fsr : null)
        });

        if (onStatusCallback) onStatusCallback(updatedDev);
        notifyListeners('status', updatedDev);
      } 
      else if (topic.endsWith('/result')) {
        // Test Result from ESP32
        // Only accept result if a check was initiated by CHECK NOW, or if explicitly fresh
        if (!isTestExpected) {
          console.warn('⚠️ Received /result but NO CHECK NOW command was initiated. Ignoring random/stray result.');
          return;
        }

        // Test completed: clear expected flag
        isTestExpected = false;
        if (testExpectedTimer) clearTimeout(testExpectedTimer);

        console.log('🌴 30-Second Motor & FSR Test Result Received from ESP32:', data);
        
        const record = await addHistoryRecord({
          device_code: data.device_id || config.deviceId,
          tree_code: config.treeId,
          check_type: data.check_type || 'MANUAL',
          result: data.result || (data.detected ? 'UNHEALTHY' : 'HEALTHY'),
          detected: Boolean(data.detected),
          detection_time: data.detection_time !== undefined ? parseFloat(data.detection_time) : (data.detected ? 0.0 : 30.0),
          duration: data.duration !== undefined ? parseFloat(data.duration) : 30.0,
          fsr_value: data.fsr_value !== undefined ? parseInt(data.fsr_value) : null,
          started_at: data.started_at || new Date(Date.now() - 30000).toISOString(),
          notes: data.notes || (data.detected ? `FSR value exceeded threshold (> 1000) at ${data.detection_time}s` : 'Clean 30-second evaluation completed (FSR <= 1000).')
        });

        await updateDeviceStatus(config.deviceId, {
          status: 'ONLINE',
          last_tree_status: record.result
        });

        if (onResultCallback) onResultCallback(record);
        notifyListeners('result', record);
      }
    } catch (err) {
      console.error('Error handling MQTT message:', err);
    }
  });

  mqttClient.on('error', (err) => {
    console.warn('⚠️ MQTT Error:', err.message);
  });

  mqttClient.on('offline', () => {
    console.warn('⚠️ MQTT Client is offline');
  });

  return mqttClient;
}

export function sendCheckNowCommand(checkType = 'MANUAL') {
  // Only expect result when user explicitly triggers check now
  isTestExpected = true;
  if (testExpectedTimer) clearTimeout(testExpectedTimer);
  // Allow 45s maximum window (30s test duration + 15s network latency)
  testExpectedTimer = setTimeout(() => {
    isTestExpected = false;
    console.log('⏱️ Check Now 45s window expired. Disarming result listener.');
  }, 45000);

  if (!mqttClient || !mqttClient.connected) {
    console.warn('⚠️ MQTT client not connected. Command will be queued by broker or virtual device.');
  }

  const topic = `devices/${config.deviceId}/command`;
  const payload = JSON.stringify({
    action: 'START_TEST',
    device_id: config.deviceId,
    check_type: checkType,
    timestamp: new Date().toISOString()
  });

  console.log(`📤 Publishing MQTT Command to [${topic}]:`, payload);
  mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error('Failed to publish MQTT command:', err.message);
    } else {
      console.log('✅ START_TEST command published to MQTT broker successfully!');
    }
  });

  notifyListeners('command_sent', { topic, checkType, timestamp: new Date().toISOString() });
}

export function subscribeEvents(listener) {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}

function notifyListeners(eventType, payload) {
  for (const listener of eventListeners) {
    try {
      listener(eventType, payload);
    } catch (e) {
      console.error('Error in event listener:', e);
    }
  }
}

