import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Battery, 
  MapPin, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const SensorData = () => {
  const { user } = useAuth();
  const [latestData, setLatestData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('24h');

  // Fetch latest sensor data
  const fetchLatestData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/sensor/latest`, {
        headers: { 'x-auth-token': token }
      });
      setLatestData(res.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching latest sensor data:', error);
      }
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/sensor/analytics?period=${period}`, {
        headers: { 'x-auth-token': token }
      });
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch sensor history
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/sensor/history?limit=10`, {
        headers: { 'x-auth-token': token }
      });
      setHistory(res.data.data || []);
    } catch (error) {
      console.error('Error fetching sensor history:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLatestData(),
        fetchAnalytics(),
        fetchHistory()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, period]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchLatestData();
        fetchAnalytics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, period]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getAccelerationStatus = (acc) => {
    if (!acc) return { color: '#6b7280', status: 'No data' };
    const total = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
    if (total > 15) return { color: '#ef4444', status: 'High Impact' };
    if (total < 2) return { color: '#f59e0b', status: 'Low Activity' };
    return { color: '#10b981', status: 'Normal' };
  };

  const getGyroscopeStatus = (gyro) => {
    if (!gyro) return { color: '#6b7280', status: 'No data' };
    const total = Math.sqrt(gyro.x*gyro.x + gyro.y*gyro.y + gyro.z*gyro.z);
    if (total > 200) return { color: '#ef4444', status: 'Rapid Movement' };
    if (total > 100) return { color: '#f59e0b', status: 'Active' };
    return { color: '#10b981', status: 'Stable' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '20px' }}>
        <div className="text-white text-xl">Loading sensor data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: '20px' }}>
      <div className="container py-16">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="text-3xl font-bold text-white mb-4">ESP32 Sensor Data</h1>
          <p className="text-gray-400">Real-time monitoring from your Smart Safety Band</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {['1h', '24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {p === '1h' ? '1 Hour' : p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>

        {!latestData ? (
          <div className="card p-8 text-center">
            <Smartphone className="mx-auto mb-4" style={{ width: '48px', height: '48px', color: '#6b7280' }} />
            <h3 className="text-xl font-semibold text-white mb-2">No Sensor Data</h3>
            <p className="text-gray-400 mb-4">
              Your ESP32 hasn't sent any data yet. Make sure your device is connected and sending data.
            </p>
            <div className="text-sm text-gray-500">
              <p>ESP32 should send data to: <code className="bg-gray-800 px-2 py-1 rounded">POST /receive</code></p>
              <p className="mt-2">Expected format: <code className="bg-gray-800 px-2 py-1 rounded">{"{"}"accX": 1.2, "accY": -0.5, "accZ": 9.8, "gyroX": 10, "gyroY": -5, "gyroZ": 2{"}"}</code></p>
            </div>
          </div>
        ) : (
          <>
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Accelerometer */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                  <span className="text-xs text-gray-400">
                    {formatTime(latestData.createdAt)}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-2">Accelerometer</div>
                {latestData.accelerometer ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">X:</span>
                      <span className="text-white">{latestData.accelerometer.x.toFixed(2)}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Y:</span>
                      <span className="text-white">{latestData.accelerometer.y.toFixed(2)}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Z:</span>
                      <span className="text-white">{latestData.accelerometer.z.toFixed(2)}g</span>
                    </div>
                    <div 
                      className="text-sm font-medium mt-2"
                      style={{ color: getAccelerationStatus(latestData.accelerometer).color }}
                    >
                      {getAccelerationStatus(latestData.accelerometer).status}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No data</div>
                )}
              </div>

              {/* Gyroscope */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp style={{ width: '24px', height: '24px', color: '#10b981' }} />
                  <span className="text-xs text-gray-400">
                    {formatTime(latestData.createdAt)}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-2">Gyroscope</div>
                {latestData.gyroscope ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">X:</span>
                      <span className="text-white">{latestData.gyroscope.x.toFixed(2)}°/s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Y:</span>
                      <span className="text-white">{latestData.gyroscope.y.toFixed(2)}°/s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Z:</span>
                      <span className="text-white">{latestData.gyroscope.z.toFixed(2)}°/s</span>
                    </div>
                    <div 
                      className="text-sm font-medium mt-2"
                      style={{ color: getGyroscopeStatus(latestData.gyroscope).color }}
                    >
                      {getGyroscopeStatus(latestData.gyroscope).status}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No data</div>
                )}
              </div>

              {/* Device Status */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Smartphone style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                  <span className="text-xs text-gray-400">
                    {formatTime(latestData.createdAt)}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-2">ESP32 Status</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Device:</span>
                    <span className="text-white">{latestData.deviceId || 'ESP32_001'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Update:</span>
                    <span className="text-white">{formatTime(latestData.createdAt)}</span>
                  </div>
                  <div 
                    className="text-sm font-medium mt-2"
                    style={{ color: '#10b981' }}
                  >
                    Connected
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            {analytics && (
              <div className="card p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingUp style={{ width: '20px', height: '20px' }} />
                  Analytics ({period})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Movement Data</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Readings:</span>
                        <span className="text-white font-medium">{analytics.analytics.totalReadings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Fall Alerts:</span>
                        <span className="text-red-400 font-medium">{analytics.analytics.fallCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Emergency Alerts:</span>
                        <span className="text-yellow-400 font-medium">{analytics.analytics.emergencyCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Device Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Connection:</span>
                        <span className="text-green-400 font-medium">Stable</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Data Quality:</span>
                        <span className="text-green-400 font-medium">Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Update Rate:</span>
                        <span className="text-white font-medium">5s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent History */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Clock style={{ width: '20px', height: '20px' }} />
                Recent Readings
              </h3>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No historical data available</p>
                ) : (
                  history.map((reading, index) => (
                    <div key={reading._id || index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                          {new Date(reading.createdAt).toLocaleString()}
                        </div>
                        {(reading.emergencyTriggered || reading.fallDetected) && (
                          <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        {reading.accelerometer && (
                          <div className="flex items-center gap-1">
                            <Activity style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                            <span className="text-white">
                              {Math.sqrt(
                                reading.accelerometer.x**2 + 
                                reading.accelerometer.y**2 + 
                                reading.accelerometer.z**2
                              ).toFixed(1)}g
                            </span>
                          </div>
                        )}
                        {reading.gyroscope && (
                          <div className="flex items-center gap-1">
                            <TrendingUp style={{ width: '14px', height: '14px', color: '#10b981' }} />
                            <span className="text-white">
                              {Math.sqrt(
                                reading.gyroscope.x**2 + 
                                reading.gyroscope.y**2 + 
                                reading.gyroscope.z**2
                              ).toFixed(1)}°/s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SensorData;