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
  const [recentActivity, setRecentActivity] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('24h');
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'activity'

  // Fetch latest sensor data
  const fetchLatestData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/sensor/latest`, {
        headers: { 'x-auth-token': token }
      });
      console.log('Latest sensor data:', res.data); // Debug log
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

  // Fetch recent ESP32 activity
  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/sensor/esp32/recent?limit=50`, {
        headers: { 'x-auth-token': token }
      });
      setRecentActivity(res.data.data || []);
      setActivitySummary(res.data.summary || null);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLatestData(),
        fetchAnalytics(),
        fetchHistory(),
        fetchRecentActivity()
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
        fetchRecentActivity();
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

  // Generate test data
  const generateTestData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/sensor/test`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      toast.success('Test sensor data generated successfully!');
      
      // Refresh all data
      await Promise.all([
        fetchLatestData(),
        fetchAnalytics(),
        fetchHistory(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error('Failed to generate test data');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'emergency': return '#ef4444';
      case 'fall': return '#f59e0b';
      case 'normal': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (item) => {
    if (item.emergencyTriggered) return 'Emergency Alert';
    if (item.fallDetected) return 'Fall Detected';
    return 'Normal Reading';
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">ESP32 Sensor Data</h1>
              <p className="text-gray-400">Real-time monitoring from your Smart Safety Band</p>
            </div>
            <button
              onClick={generateTestData}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Generate Test Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'current'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Current Status
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'activity'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Recent Activity ({recentActivity.length})
          </button>
        </div>

        {/* Period Selector - only show for current tab */}
        {activeTab === 'current' && (
          <div className="flex gap-2 mb-8">
            {['1h', '24h', '7d', '30d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p === '1h' ? '1 Hour' : p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'current' ? (
          // Current Status Tab
          !latestData ? (
            <div className="card p-8 text-center">
              <Smartphone className="mx-auto mb-4" style={{ width: '48px', height: '48px', color: '#6b7280' }} />
              <h3 className="text-xl font-semibold text-white mb-2">No Sensor Data</h3>
              <p className="text-gray-400 mb-4">
                Your ESP32 hasn't sent any data yet. Make sure your device is connected and sending data.
              </p>
              <div className="text-sm text-gray-500">
                <p>ESP32 should send data to: <code className="bg-gray-800 px-2 py-1 rounded">POST /receive</code></p>
                <p className="mt-2">Expected format: <code className="bg-gray-800 px-2 py-1 rounded">{"{"}"accelerometer": {"{"}"x": 1.2, "y": -0.5, "z": 9.8{"}"}, "gyroscope": {"{"}"x": 10, "y": -5, "z": 2{"}"}, "latitude": 28.6118, "longitude": 77.0378{"}"}</code></p>
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

              {/* GPS Location */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <MapPin style={{ width: '24px', height: '24px', color: '#10b981' }} />
                  <span className="text-xs text-gray-400">
                    {formatTime(latestData.createdAt)}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-2">GPS Location</div>
                {latestData.location ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Latitude:</span>
                      <span className="text-white">{latestData.location.latitude.toFixed(6)}°</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Longitude:</span>
                      <span className="text-white">{latestData.location.longitude.toFixed(6)}°</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Accuracy:</span>
                      <span className="text-white">±{latestData.location.accuracy || 10}m</span>
                    </div>
                    <div 
                      className="text-sm font-medium mt-2"
                      style={{ color: '#10b981' }}
                    >
                      GPS Active
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No GPS data</div>
                )}
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
        )
        ) : (
          // Recent Activity Tab
          <div className="space-y-6">
            {/* Activity Summary */}
            {activitySummary && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Activity Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{activitySummary.totalReadings}</div>
                    <div className="text-sm text-gray-400">Total Readings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{activitySummary.devicesActive}</div>
                    <div className="text-sm text-gray-400">Active Devices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{activitySummary.fallCount}</div>
                    <div className="text-sm text-gray-400">Fall Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{activitySummary.emergencyCount}</div>
                    <div className="text-sm text-gray-400">Emergency Alerts</div>
                  </div>
                </div>
              </div>
            )}

            {/* All ESP32 Data */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Activity style={{ width: '20px', height: '20px' }} />
                All ESP32 Sensor Data
              </h3>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Smartphone className="mx-auto mb-4" style={{ width: '48px', height: '48px', color: '#6b7280' }} />
                  <p className="text-gray-400">No ESP32 data found</p>
                  <p className="text-sm text-gray-500 mt-2">Generate test data or connect your ESP32 device</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item, index) => (
                    <div key={item.id || index} className="p-4 bg-gray-800/50 rounded-lg border-l-4" 
                         style={{ borderLeftColor: getStatusColor(item.status) }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Smartphone style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                            <span className="text-sm font-medium text-white">{item.deviceId}</span>
                          </div>
                          <div 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getStatusColor(item.status) + '20',
                              color: getStatusColor(item.status)
                            }}
                          >
                            {getStatusText(item)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Accelerometer */}
                        {item.accelerometer && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-300">
                              <Activity style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                              Accelerometer
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-400">X:</span>
                                <span className="text-white">{item.accelerometer.x.toFixed(2)}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Y:</span>
                                <span className="text-white">{item.accelerometer.y.toFixed(2)}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Z:</span>
                                <span className="text-white">{item.accelerometer.z.toFixed(2)}g</span>
                              </div>
                              {item.totalAcceleration && (
                                <div className="flex justify-between font-medium">
                                  <span className="text-gray-400">Total:</span>
                                  <span className="text-blue-400">{item.totalAcceleration.toFixed(2)}g</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Gyroscope */}
                        {item.gyroscope && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-300">
                              <TrendingUp style={{ width: '14px', height: '14px', color: '#10b981' }} />
                              Gyroscope
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-400">X:</span>
                                <span className="text-white">{item.gyroscope.x.toFixed(2)}°/s</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Y:</span>
                                <span className="text-white">{item.gyroscope.y.toFixed(2)}°/s</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Z:</span>
                                <span className="text-white">{item.gyroscope.z.toFixed(2)}°/s</span>
                              </div>
                              {item.totalRotation && (
                                <div className="flex justify-between font-medium">
                                  <span className="text-gray-400">Total:</span>
                                  <span className="text-green-400">{item.totalRotation.toFixed(2)}°/s</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* GPS Location */}
                        {item.location && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-300">
                              <MapPin style={{ width: '14px', height: '14px', color: '#10b981' }} />
                              GPS Location
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Lat:</span>
                                <span className="text-white">{item.location.latitude.toFixed(6)}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Lng:</span>
                                <span className="text-white">{item.location.longitude.toFixed(6)}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Acc:</span>
                                <span className="text-white">±{item.location.accuracy || 10}m</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Sensors */}
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-300">Additional Data</div>
                          <div className="text-xs space-y-1">
                            {item.heartRate && (
                              <div className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Heart style={{ width: '12px', height: '12px' }} />
                                  HR:
                                </span>
                                <span className="text-white">{item.heartRate} BPM</span>
                              </div>
                            )}
                            {item.temperature && (
                              <div className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Thermometer style={{ width: '12px', height: '12px' }} />
                                  Temp:
                                </span>
                                <span className="text-white">{item.temperature.toFixed(1)}°C</span>
                              </div>
                            )}
                            {item.batteryLevel && (
                              <div className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Battery style={{ width: '12px', height: '12px' }} />
                                  Battery:
                                </span>
                                <span className="text-white">{item.batteryLevel}%</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-400">Time:</span>
                              <span className="text-white">{formatTime(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorData;