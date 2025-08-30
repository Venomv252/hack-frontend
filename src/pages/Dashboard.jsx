import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Bell, 
  Users, 
  AlertTriangle,
  Wifi,
  Clock,
  Edit3,
  X,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  Lock,
  Activity,
  Heart,
  Thermometer,
  Battery,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [deviceStatus] = useState({
    connected: true,
    lastSync: 'Just now'
  });

  const [emergencyContacts, setEmergencyContacts] = useState(user?.emergencyContacts || []);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [sensorData, setSensorData] = useState({
    latest: null,
    recent: [],
    summary: null,
    dataRetentionInfo: null
  });

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const res = await axios.get(`${API_BASE_URL}/api/activities?limit=4`, {
        headers: { 'x-auth-token': token }
      });
      
      // Format activities with relative time
      const formattedActivities = (res.data.activities || []).map(activity => ({
        ...activity,
        time: formatRelativeTime(activity.createdAt)
      }));
      
      setRecentActivity(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setRecentActivity([]);
    }
  };

  // Fetch sensor data for dashboard
  const fetchSensorData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const res = await axios.get(`${API_BASE_URL}/api/sensor/dashboard`, {
        headers: { 'x-auth-token': token }
      });
      
      setSensorData(res.data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setSensorData({
        latest: null,
        recent: [],
        summary: null,
        dataRetentionInfo: null
      });
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Sync user data when it changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setEmergencyContacts(user.emergencyContacts || []);
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      fetchRecentActivities();
      fetchSensorData();
    }
  }, [user]);

  // Auto-refresh sensor data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchSensorData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleEmergencyTest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Create activity log
        await axios.post(`${API_BASE_URL}/api/activities`, {
          type: 'emergency',
          message: 'Emergency test initiated successfully',
          status: 'success'
        }, {
          headers: { 'x-auth-token': token }
        });
        
        // Refresh activities
        fetchRecentActivities();
      }
      
      toast.success('Emergency test initiated! Your contacts would receive alerts.');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Emergency test initiated! Your contacts would receive alerts.');
    }
  };

  const handleShareLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to share location');
        return;
      }

      // Check if user has emergency contacts
      if (!emergencyContacts || emergencyContacts.length === 0) {
        toast.error('Please add emergency contacts first');
        return;
      }

      toast.loading('Sending emergency location SMS...', { id: 'location-share' });

      const response = await axios.post(`${API_BASE_URL}/api/emergency/share-location`, {}, {
        headers: { 'x-auth-token': token }
      });

      const { results, errors, summary } = response.data;

      if (summary.successful > 0) {
        toast.success(
          `Location shared successfully! ${summary.successful}/${summary.totalContacts} contacts notified.`,
          { id: 'location-share', duration: 5000 }
        );

        // Log successful contacts
        results.forEach(result => {
          console.log(`✅ SMS sent to ${result.contact}: ${result.messageSid}`);
        });

        // Log any errors
        if (errors.length > 0) {
          console.warn('Some contacts could not be reached:', errors);
          toast.error(`${errors.length} contacts could not be reached`, { duration: 3000 });
        }

      } else {
        toast.error('Failed to send location to any contacts', { id: 'location-share' });
      }

    } catch (error) {
      console.error('Error sharing location:', error);
      
      if (error.response?.status === 404 && error.response?.data?.message === 'No location data available') {
        toast.error('No GPS location available. Please ensure your device is sending location data.', { id: 'location-share' });
      } else if (error.response?.status === 503 && error.response?.data?.message?.includes('SMS service is not configured')) {
        toast.error('SMS service is not configured on the server. Please contact administrator.', { id: 'location-share' });
      } else if (error.response?.status === 404 && error.response?.data?.message === 'User not found') {
        toast.error('User not found. Please log in again.', { id: 'location-share' });
      } else {
        toast.error('Failed to share location. Please try again.', { id: 'location-share' });
      }
    }
  };



  // Profile update handlers
  const handleProfileUpdate = async () => {
    // Validation
    if (!profileForm.name.trim()) {
      toast.error('Please enter a valid name');
      return;
    }
    
    if (!profileForm.email.trim()) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (!profileForm.phone.trim()) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Password validation if changing password
    if (profileForm.newPassword) {
      if (!profileForm.currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    try {
      const updateData = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim()
      };

      // Add password fields if changing password
      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const result = await updateUser(updateData);
      if (result.success) {
        setCurrentUser(prev => ({ 
          ...prev, 
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim()
        }));
        
        // Create activity log
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await axios.post(`${API_BASE_URL}/api/activities`, {
              type: 'system',
              message: profileForm.newPassword ? 'Profile and password updated' : 'Profile information updated',
              status: 'success'
            }, {
              headers: { 'x-auth-token': token }
            });
            fetchRecentActivities();
          } catch (error) {
            console.error('Error creating activity:', error);
          }
        }
        
        toast.success('Profile updated successfully!');
        setShowProfileModal(false);
        // Reset password fields
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Contact management handlers
  const handleAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', phone: '', relationship: '' });
    setShowContactModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name || '',
      phone: contact.phone || '',
      relationship: contact.relationship || ''
    });
    setShowContactModal(true);
  };

  const handleSaveContact = async () => {
    if (contactForm.name.trim() && contactForm.phone.trim() && contactForm.relationship.trim()) {
      let updatedContacts;
      
      if (editingContact) {
        // Update existing contact
        updatedContacts = emergencyContacts.map(contact =>
          (contact.id || contact._id) === (editingContact.id || editingContact._id)
            ? { ...contact, ...contactForm }
            : contact
        );
      } else {
        // Add new contact
        const newContact = {
          id: Date.now().toString(),
          ...contactForm
        };
        updatedContacts = [...emergencyContacts, newContact];
      }

      try {
        const result = await updateUser({ emergencyContacts: updatedContacts });
        if (result.success) {
          setEmergencyContacts(updatedContacts);
          toast.success(editingContact ? 'Contact updated successfully!' : 'Contact added successfully!');
          setShowContactModal(false);
          setContactForm({ name: '', phone: '', relationship: '' });
          setEditingContact(null);
        } else {
          toast.error(result.error || 'Failed to save contact');
        }
      } catch (error) {
        toast.error('Failed to save contact');
      }
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleDeleteContact = async (contactId) => {
    const updatedContacts = emergencyContacts.filter(contact => (contact.id || contact._id) !== contactId);
    
    try {
      const result = await updateUser({ emergencyContacts: updatedContacts });
      if (result.success) {
        setEmergencyContacts(updatedContacts);
        toast.success('Contact deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete contact');
      }
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sync': return <Wifi style={{ width: '16px', height: '16px' }} />;
      case 'location': return <MapPin style={{ width: '16px', height: '16px' }} />;
      case 'emergency': return <AlertTriangle style={{ width: '16px', height: '16px' }} />;
      case 'system': return <Shield style={{ width: '16px', height: '16px' }} />;
      default: return <Shield style={{ width: '16px', height: '16px' }} />;
    }
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '20px' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: '20px' }}>
      <div className="container py-16">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {currentUser?.name || 'User'}!
            </h1>
            <button
              onClick={() => {
                setProfileForm({
                  name: currentUser?.name || '',
                  email: currentUser?.email || '',
                  phone: currentUser?.phone || '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setShowProfileModal(true);
              }}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit3 style={{ width: '16px', height: '16px' }} />
              Edit Profile
            </button>
          </div>
          <p className="text-gray-400">Your Smart Safety Band overview.</p>
        </div>

        {/* Main Content - Full Width Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Device Status and Emergency Actions Row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Device Status */}
            <div className="card" style={{ padding: '20px', flex: '1', minWidth: '300px' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Device Status</h2>
                <div 
                  className="flex items-center" 
                  style={{ 
                    gap: '6px', 
                    color: deviceStatus.connected ? '#10b981' : '#ef4444' 
                  }}
                >
                  <div 
                    className="animate-pulse"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: deviceStatus.connected ? '#10b981' : '#ef4444'
                    }}
                  />
                  <span className="text-xs font-medium">
                    {deviceStatus.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: '6px' }}>
                    <Clock style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                    <span className="text-gray-300 text-sm">Last Sync</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{deviceStatus.lastSync}</span>
                </div>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="card" style={{ padding: '20px', flex: '1', minWidth: '300px' }}>
              <h2 className="text-lg font-semibold text-white mb-4">Emergency Actions</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={handleShareLocation}
                  className="transition-all"
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <MapPin style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div className="text-white font-medium text-base">🚨 Share Location</div>
                    <div className="text-gray-400 text-sm">Send emergency SMS with location to all contacts</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ESP32 Sensor Data Section */}
          <div className="card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Smartphone style={{ width: '20px', height: '20px' }} />
                ESP32 Sensor Data
              </h2>
              <div className="flex items-center gap-3">
                <Link
                  to="/sensor-data"
                  className="btn-secondary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '8px 12px', 
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                >
                  See All Readings
                </Link>
                {sensorData.dataRetentionInfo && (
                  <div className="text-xs text-gray-400">
                    Auto-delete after {sensorData.dataRetentionInfo.retentionPeriod}
                  </div>
                )}
              </div>
            </div>

            {!sensorData.latest ? (
              <div className="text-center py-8">
                <Smartphone className="mx-auto mb-4" style={{ width: '48px', height: '48px', color: '#6b7280' }} />
                <h3 className="text-lg font-semibold text-white mb-2">No Sensor Data</h3>
                <p className="text-gray-400 mb-4">
                  No ESP32 data received yet. Make sure your device is connected and sending data.
                </p>
                <div className="text-sm text-gray-500">
                  <p>ESP32 should send data to: <code className="bg-gray-800 px-2 py-1 rounded">POST /receive</code></p>
                  <p className="mt-2">Expected format: <code className="bg-gray-800 px-2 py-1 rounded">{"{"}"accelerometer": {"{"}"x": 1.2, "y": -0.5, "z": 9.8{"}"}, "gyroscope": {"{"}"x": 10, "y": -5, "z": 2{"}"}, "latitude": 28.6118, "longitude": 77.0378{"}"}</code></p>
                </div>
              </div>
            ) : (
              <div>
                {/* Latest Sensor Readings */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Latest Sensor Readings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Accelerometer */}
                    {sensorData.latest.accelerometer && (
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                          <span className="text-sm font-medium text-gray-300">Accelerometer</span>
                        </div>
                        <div className="text-lg font-bold text-white mb-1">
                          {sensorData.latest.totalAcceleration?.toFixed(2) || '0.00'}g
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>X: {sensorData.latest.accelerometer.x.toFixed(2)}g</div>
                          <div>Y: {sensorData.latest.accelerometer.y.toFixed(2)}g</div>
                          <div>Z: {sensorData.latest.accelerometer.z.toFixed(2)}g</div>
                        </div>
                      </div>
                    )}

                    {/* Gyroscope */}
                    {sensorData.latest.gyroscope && (
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp style={{ width: '16px', height: '16px', color: '#10b981' }} />
                          <span className="text-sm font-medium text-gray-300">Gyroscope</span>
                        </div>
                        <div className="text-lg font-bold text-white mb-1">
                          {sensorData.latest.totalRotation?.toFixed(2) || '0.00'}°/s
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>X: {sensorData.latest.gyroscope.x.toFixed(2)}°/s</div>
                          <div>Y: {sensorData.latest.gyroscope.y.toFixed(2)}°/s</div>
                          <div>Z: {sensorData.latest.gyroscope.z.toFixed(2)}°/s</div>
                        </div>
                      </div>
                    )}

                    {/* Latitude */}
                    {sensorData.latest.location && (
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin style={{ width: '16px', height: '16px', color: '#10b981' }} />
                          <span className="text-sm font-medium text-gray-300">Latitude</span>
                        </div>
                        <div className="text-lg font-bold text-white mb-1">
                          {sensorData.latest.location.latitude.toFixed(6)}°
                        </div>
                        <div className="text-xs text-gray-400">
                          North/South Position
                        </div>
                      </div>
                    )}

                    {/* Longitude */}
                    {sensorData.latest.location && (
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin style={{ width: '16px', height: '16px', color: '#10b981' }} />
                          <span className="text-sm font-medium text-gray-300">Longitude</span>
                        </div>
                        <div className="text-lg font-bold text-white mb-1">
                          {sensorData.latest.location.longitude.toFixed(6)}°
                        </div>
                        <div className="text-xs text-gray-400">
                          East/West Position
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Show message if no sensor data */}
                  {(!sensorData.latest.accelerometer && !sensorData.latest.gyroscope && !sensorData.latest.location) && (
                    <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                      <Smartphone className="mx-auto mb-2" style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                      <div className="text-gray-400">No sensor data available</div>
                    </div>
                  )}
                </div>

                {/* Summary Statistics */}
                {sensorData.summary && sensorData.summary.totalReadings > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Last 30 Minutes Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-white">{sensorData.summary.totalReadings}</div>
                        <div className="text-sm text-gray-400">Total Readings</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{sensorData.summary.fallCount}</div>
                        <div className="text-sm text-gray-400">Fall Detections</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{sensorData.summary.emergencyCount}</div>
                        <div className="text-sm text-gray-400">Emergency Alerts</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Readings */}
                {sensorData.recent && sensorData.recent.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Recent Readings</h3>
                      <Link
                        to="/sensor-data"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        View All →
                      </Link>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {sensorData.recent.slice(0, 5).map((reading, index) => (
                        <div key={reading.id || index} className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ 
                                  backgroundColor: reading.status === 'emergency' ? '#ef4444' : 
                                                 reading.status === 'fall' ? '#f59e0b' : '#10b981' 
                                }}
                              />
                              <div className="text-sm font-medium text-white">
                                {reading.status === 'emergency' ? 'Emergency Alert' : 
                                 reading.status === 'fall' ? 'Fall Detected' : 'Normal Reading'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatRelativeTime(reading.timestamp)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            {reading.totalAcceleration && (
                              <div className="flex items-center gap-1">
                                <Activity style={{ width: '12px', height: '12px', color: '#3b82f6' }} />
                                <span className="text-gray-400">Accel:</span>
                                <span className="text-white">{reading.totalAcceleration.toFixed(1)}g</span>
                              </div>
                            )}
                            {reading.totalRotation && (
                              <div className="flex items-center gap-1">
                                <TrendingUp style={{ width: '12px', height: '12px', color: '#10b981' }} />
                                <span className="text-gray-400">Gyro:</span>
                                <span className="text-white">{reading.totalRotation.toFixed(1)}°/s</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock style={{ width: '12px', height: '12px', color: '#6b7280' }} />
                              <span className="text-gray-400">Device:</span>
                              <span className="text-white">{reading.deviceId || 'ESP32_001'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Smartphone style={{ width: '12px', height: '12px', color: '#6b7280' }} />
                              <span className="text-gray-400">Status:</span>
                              <span 
                                className="font-medium"
                                style={{ 
                                  color: reading.status === 'emergency' ? '#ef4444' : 
                                         reading.status === 'fall' ? '#f59e0b' : '#10b981' 
                                }}
                              >
                                {reading.status === 'emergency' ? 'Alert' : 
                                 reading.status === 'fall' ? 'Fall' : 'OK'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show message when no recent readings */}
                {(!sensorData.recent || sensorData.recent.length === 0) && sensorData.latest && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Recent Readings</h3>
                    <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                      <Clock className="mx-auto mb-2" style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                      <div className="text-gray-400">No recent readings available</div>
                      <div className="text-xs text-gray-500 mt-1">Only latest reading is shown above</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Contacts and Safety Score Row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Emergency Contacts */}
            <div className="card" style={{ padding: '24px', flex: '2', minWidth: '400px' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Emergency Contacts</h2>
                <button
                  onClick={handleAddContact}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Add Contact
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {(emergencyContacts || []).map((contact, index) => (
                  <div 
                    key={contact.id || contact._id || index} 
                    className="flex items-center" 
                    style={{ 
                      gap: '12px', 
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px' 
                    }}
                  >
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-white font-medium text-base">{contact.name}</div>
                      <div className="text-gray-400 text-sm">{contact.phone}</div>
                      <div className="text-gray-500 text-sm">{contact.relationship}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditContact(contact)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '4px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: '#60a5fa'
                        }}
                      >
                        <Edit3 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id || contact._id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '4px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: '#f87171'
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Score */}
            <div className="card" style={{ padding: '24px', flex: '1', minWidth: '300px' }}>
              <h2 className="text-xl font-semibold text-white mb-6">Safety Score</h2>
              
              <div className="text-center">
                <div 
                  style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <span className="text-2xl font-bold text-white">95</span>
                </div>
                <div className="font-semibold mb-4" style={{ color: '#10b981', fontSize: '16px' }}>Excellent</div>
                <div className="text-gray-400 text-sm">
                  Your safety setup is optimized and ready for emergencies.
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Device Connection</span>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Emergency Contacts</span>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location Services</span>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">System Status</span>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <Link
                to="/activity-log"
                className="btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 12px', 
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                See All
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(recentActivity || []).slice(0, 4).map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center" 
                  style={{ 
                    gap: '12px', 
                    padding: '12px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '8px' 
                  }}
                >
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#374151',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af'
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="text-white text-sm">{activity.message}</div>
                    <div className="text-gray-400 text-xs">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {showProfileModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div className="card" style={{ padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="input"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="input"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Change Password (Optional)</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        className="input"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        className="input"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div className="card" style={{ padding: '32px', maxWidth: '400px', width: '90%' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingContact ? 'Edit Contact' : 'Add Contact'}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="input"
                    placeholder="Contact name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="input"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                    Relationship
                  </label>
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    className="input"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}>Select relationship</option>
                    <option value="Parent" style={{ backgroundColor: '#1f2937', color: 'white' }}>Parent</option>
                    <option value="Mother" style={{ backgroundColor: '#1f2937', color: 'white' }}>Mother</option>
                    <option value="Father" style={{ backgroundColor: '#1f2937', color: 'white' }}>Father</option>
                    <option value="Spouse" style={{ backgroundColor: '#1f2937', color: 'white' }}>Spouse</option>
                    <option value="Partner" style={{ backgroundColor: '#1f2937', color: 'white' }}>Partner</option>
                    <option value="Sibling" style={{ backgroundColor: '#1f2937', color: 'white' }}>Sibling</option>
                    <option value="Child" style={{ backgroundColor: '#1f2937', color: 'white' }}>Child</option>
                    <option value="Grandparent" style={{ backgroundColor: '#1f2937', color: 'white' }}>Grandparent</option>
                    <option value="Relative" style={{ backgroundColor: '#1f2937', color: 'white' }}>Other Relative</option>
                    <option value="Friend" style={{ backgroundColor: '#1f2937', color: 'white' }}>Friend</option>
                    <option value="Best Friend" style={{ backgroundColor: '#1f2937', color: 'white' }}>Best Friend</option>
                    <option value="Roommate" style={{ backgroundColor: '#1f2937', color: 'white' }}>Roommate</option>
                    <option value="Colleague" style={{ backgroundColor: '#1f2937', color: 'white' }}>Colleague</option>
                    <option value="Boss" style={{ backgroundColor: '#1f2937', color: 'white' }}>Boss</option>
                    <option value="Neighbor" style={{ backgroundColor: '#1f2937', color: 'white' }}>Neighbor</option>
                    <option value="Doctor" style={{ backgroundColor: '#1f2937', color: 'white' }}>Doctor</option>
                    <option value="Caregiver" style={{ backgroundColor: '#1f2937', color: 'white' }}>Caregiver</option>
                    <option value="Emergency Services" style={{ backgroundColor: '#1f2937', color: 'white' }}>Emergency Services</option>
                    <option value="Police" style={{ backgroundColor: '#1f2937', color: 'white' }}>Police</option>
                    <option value="Fire Department" style={{ backgroundColor: '#1f2937', color: 'white' }}>Fire Department</option>
                    <option value="Medical" style={{ backgroundColor: '#1f2937', color: 'white' }}>Medical Emergency</option>
                    <option value="Other" style={{ backgroundColor: '#1f2937', color: 'white' }}>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContact}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;