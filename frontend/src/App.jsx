import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/views/DashboardView';
import DevicesView from './components/views/DevicesView';
import TreesView from './components/views/TreesView';
import HistoryView from './components/views/HistoryView';
import SchedulesView from './components/views/SchedulesView';
import AlertsView from './components/views/AlertsView';

import LiveTestModal from './components/LiveTestModal';
import HardwareGuideModal from './components/HardwareGuideModal';
import LoginModal from './components/LoginModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://esiotnew.onrender.com';
const API_BASE = BACKEND_URL.replace(/\/$/, '') + '/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [customer, setCustomer] = useState({
    name: 'Coconut Farmer',
    email: 'demo@treehealth.com',
    customerCode: 'CUST-001'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Modals state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [latestTestResult, setLatestTestResult] = useState(null);

  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Check Backend Server Health
  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const json = await res.json();
      setIsBackendOnline(json.status === 'ok');
    } catch {
      setIsBackendOnline(false);
    }
  };

  // Fetch Dashboard Summary Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
        if (json.data.schedules) setSchedules(json.data.schedules);
        setIsBackendOnline(true);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setIsBackendOnline(false);
    }
  };

  // Fetch History Logs
  const fetchHistoryData = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const json = await res.json();
      if (json.success) {
        setHistory(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  // Initial load & periodic background refresh
  useEffect(() => {
    checkBackendHealth();
    fetchDashboardData();
    fetchHistoryData();

    const interval = setInterval(() => {
      checkBackendHealth();
      fetchDashboardData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Server-Sent Events (SSE) Listener for instant updates
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource(`${API_BASE}/events`);

      eventSource.addEventListener('result', (e) => {
        try {
          const record = JSON.parse(e.data);
          console.log('⚡ SSE Result Event Received:', record);
          setLatestTestResult(record);
          setIsTesting(false);
          setIsTestModalOpen(false);
          fetchDashboardData();
          fetchHistoryData();
        } catch (err) {
          console.error('Error parsing SSE result:', err);
        }
      });

      eventSource.addEventListener('status', (e) => {
        fetchDashboardData();
      });

      eventSource.onerror = (err) => {
        if (eventSource) eventSource.close();
      };
    } catch (e) {
      console.warn('SSE init failed:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Action: Trigger CHECK NOW
  const handleCheckNow = async () => {
    setIsTesting(true);
    setLatestTestResult(null);
    setIsTestModalOpen(false); // Update directly in dashboard, do not show popup modal

    try {
      const res = await fetch(`${API_BASE}/check-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_type: 'MANUAL' })
      });
      await res.json();
    } catch (err) {
      console.error('Check Now error:', err);
    }

    // Auto-refresh and finish testing state after the 30-second window completes
    setTimeout(() => {
      setIsTesting(false);
      fetchDashboardData();
      fetchHistoryData();
    }, 31000);
  };

  // Action: Save Schedules
  const handleSaveSchedules = async (updatedSchedules) => {
    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: updatedSchedules })
      });
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data);
      }
    } catch (err) {
      console.error('Save schedules error:', err);
    }
  };

  if (!isAuthenticated) {
    return <LoginModal onLogin={(userData) => { setCustomer(userData); setIsAuthenticated(true); }} />;
  }

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    devices: 'IoT Devices & Telemetry',
    trees: 'Monitored Assets',
    history: 'Inspection History Log',
    schedules: 'Automated Schedules',
    alerts: 'System Advisories'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customer={customer}
        onLogout={() => setIsAuthenticated(false)}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <Header
          title={tabTitles[activeTab] || 'Dashboard'}
          summary={summary}
          isBackendOnline={isBackendOnline}
          isTesting={isTesting}
          onCheckNow={handleCheckNow}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onToggleMobileMenu={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* View Page Container */}
        <main className="main-content-container" style={{ padding: '2rem 1.5rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              isTesting={isTesting}
              onCheckNow={handleCheckNow}
              onRefresh={() => { fetchDashboardData(); fetchHistoryData(); }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'devices' && (
            <DevicesView
              summary={summary}
              onOpenGuide={() => setIsGuideModalOpen(true)}
            />
          )}

          {activeTab === 'trees' && (
            <TreesView summary={summary} />
          )}

          {activeTab === 'history' && (
            <HistoryView history={history} />
          )}

          {activeTab === 'schedules' && (
            <SchedulesView
              schedules={schedules}
              onSaveSchedules={handleSaveSchedules}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView summary={summary} history={history} />
          )}

        </main>

      </div>

      {/* Modals */}
      <LiveTestModal
        isOpen={isTestModalOpen}
        onClose={() => { setIsTestModalOpen(false); setIsTesting(false); }}
        latestResult={latestTestResult}
      />

      <HardwareGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
