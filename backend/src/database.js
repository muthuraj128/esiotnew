import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

let supabase = null;
let isSupabaseConnected = false;

if (config.supabaseUrl && config.supabaseKey) {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    isSupabaseConnected = true;
    console.log('⚡ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase initialization error, using local database mode:', err.message);
  }
} else {
  console.log('ℹ️ No Supabase credentials provided. Operating in Local Persistence mode.');
}

const LOCAL_DB_PATH = path.resolve('local_db.json');

// Strict timeout wrapper for cloud database queries (2.5s max to prevent server hangs)
async function withTimeout(promise, ms = 2500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Initial data structure — no pre-seeded scan history. History only grows via real CHECK NOW scans.
const initialData = {
  customer: {
    customer_code: 'CUST-001',
    name: 'Coconut Farmer',
    email: 'demo@treehealth.com'
  },
  tree: {
    tree_code: 'TREE-001',
    name: 'Coconut Palm #1',
    species: 'King Coconut (Cocos nucifera)',
    location: 'East Plot - Sector 4'
  },
  device: {
    device_code: 'THM-0001',
    status: 'OFFLINE',
    last_seen: null,
    firmware_version: 'v2.0.0-FSR',
    battery_level: null,
    signal_strength: null,
    last_tree_status: null,   // null = no scan has ever been run
    last_check_time: null,
    last_fsr_value: null
  },
  schedules: [
    { id: '1', time: '08:00', enabled: false },
    { id: '2', time: '10:00', enabled: false },
    { id: '3', time: '12:00', enabled: false },
    { id: '4', time: '14:00', enabled: false },
    { id: '5', time: '16:00', enabled: false },
    { id: '6', time: '18:00', enabled: false }
  ],
  // Empty — scan records are ONLY added when CHECK NOW is explicitly triggered and ESP32 responds
  check_history: []
};

function readLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local DB:', err.message);
  }
}

export async function getDevice(deviceCode = 'THM-0001') {
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('devices')
          .select('*')
          .eq('device_code', deviceCode)
          .maybeSingle(),
        2000
      );
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getDevice fallback to local:', e.message);
    }
  }
  const db = readLocalDb();
  return db.device;
}

export async function updateDeviceStatus(deviceCode, updateFields) {
  const db = readLocalDb();
  db.device = {
    ...db.device,
    ...updateFields,
    last_seen: new Date().toISOString()
  };
  writeLocalDb(db);

  if (supabase) {
    try {
      await withTimeout(
        supabase
          .from('devices')
          .update({ ...updateFields, last_seen: new Date().toISOString() })
          .eq('device_code', deviceCode),
        2000
      );
    } catch (e) {
      console.warn('Supabase updateDeviceStatus error:', e.message);
    }
  }

  return db.device;
}

export async function addHistoryRecord(record) {
  const db = readLocalDb();
  const detectionTime = record.detection_time !== undefined 
    ? parseFloat(record.detection_time) 
    : (record.detected ? 0.0 : 30.0);

  const newRecord = {
    id: 'hist-' + Date.now(),
    device_code: record.device_code || 'THM-0001',
    tree_code: record.tree_code || 'TREE-001',
    check_type: record.check_type || 'MANUAL',
    result: record.result,
    detected: Boolean(record.detected),
    detection_time: detectionTime,
    duration: record.duration !== undefined ? parseFloat(record.duration) : 30.0,
    fsr_value: record.fsr_value !== undefined ? parseInt(record.fsr_value) : null,
    started_at: record.started_at || new Date().toISOString(),
    completed_at: new Date().toISOString(),
    notes: record.notes || (record.detected 
      ? `FSR value exceeded threshold (> 1000) at ${detectionTime}s` 
      : 'Clean 30s evaluation completed (FSR <= 1000)')
  };

  db.check_history.unshift(newRecord);
  db.device.last_tree_status = record.result;
  db.device.last_check_time = newRecord.completed_at;
  db.device.last_fsr_value = newRecord.fsr_value;
  writeLocalDb(db);

  if (supabase) {
    try {
      await withTimeout(
        supabase.from('check_history').insert([{
          device_code: newRecord.device_code,
          tree_code: newRecord.tree_code,
          check_type: newRecord.check_type,
          result: newRecord.result,
          detected: newRecord.detected,
          detection_time: newRecord.detection_time,
          duration: newRecord.duration,
          fsr_value: newRecord.fsr_value,
          started_at: newRecord.started_at,
          completed_at: newRecord.completed_at,
          notes: newRecord.notes
        }]),
        2500
      );
    } catch (e) {
      console.warn('Supabase addHistoryRecord error:', e.message);
    }
  }

  return newRecord;
}

export async function getHistory(filterDays = null) {
  const db = readLocalDb();
  let list = db.check_history || [];

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('check_history')
          .select('*')
          .order('completed_at', { ascending: false }),
        2000
      );
      if (!error && data) list = data;
    } catch (e) {
      console.warn('Supabase getHistory fallback:', e.message);
    }
  }

  if (filterDays && Array.isArray(list)) {
    const cutoff = new Date(Date.now() - filterDays * 86400000);
    list = list.filter(item => new Date(item.completed_at) >= cutoff);
  }

  return list || [];
}

export async function getSchedules() {
  const db = readLocalDb();
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('schedules')
          .select('*'),
        2000
      );
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getSchedules fallback:', e.message);
    }
  }
  return db.schedules;
}

export async function saveSchedules(scheduleList) {
  const db = readLocalDb();
  db.schedules = scheduleList;
  writeLocalDb(db);

  if (supabase) {
    try {
      const { data: dev } = await supabase.from('devices').select('id').eq('device_code', 'THM-0001').single();
      if (dev) {
        await supabase.from('schedules').delete().eq('device_id', dev.id);
        const rows = scheduleList.map(s => ({
          device_id: dev.id,
          time: s.time,
          enabled: s.enabled
        }));
        await supabase.from('schedules').insert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveSchedules error:', e.message);
    }
  }
  return db.schedules;
}

export async function getDashboardSummary() {
  const db = readLocalDb();
  const device = await getDevice('THM-0001');
  const history = await getHistory();
  const schedules = await getSchedules();

  // latestCheck is ONLY from real scan results — never from pre-seeded fake data
  const latestCheck = (history && history.length > 0) ? history[0] : (db.check_history && db.check_history.length > 0 ? db.check_history[0] : null);

  // Tree status comes ONLY from the latest real scan result.
  // null means no scan has been run yet — dashboard will show "AWAITING SCAN"
  const currentTreeStatus = latestCheck?.result || device.last_tree_status || null;

  // Calculate real ESP32 online state (offline if no heartbeat within last 45 seconds)
  const lastSeenMs = device.last_seen ? new Date(device.last_seen).getTime() : 0;
  const isOnline = device.last_seen ? (Date.now() - lastSeenMs) < 45000 : false;

  // Real Database connection status
  const isDbConnected = isSupabaseConnected || fs.existsSync(LOCAL_DB_PATH);

  const today = new Date();
  const allHistory = history || db.check_history || [];
  const todayChecks = allHistory.filter(h => {
    const d = new Date(h.completed_at);
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }).length;

  return {
    customer: db.customer,
    tree: db.tree,
    database_connected: isDbConnected,
    device: {
      ...device,
      is_online: isOnline,
      status: isOnline ? 'ONLINE' : 'OFFLINE',
      last_tree_status: currentTreeStatus,
      last_check_time: latestCheck?.completed_at || device.last_check_time || null,
      last_fsr_value: latestCheck?.fsr_value ?? device.last_fsr_value ?? null
    },
    latest_check: latestCheck,
    schedules: schedules,
    history_count: allHistory.length,
    today_checks_completed: todayChecks
  };
}
