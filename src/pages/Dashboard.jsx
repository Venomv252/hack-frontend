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
import VoiceSOS from '../components/VoiceSOS';
import WhatsAppManager from '../components/WhatsAppManager';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [deviceStatus] = useState({
    connected: true,
    lastSync: 'Just now'
  });

  const [emergencyContacts, setEmergencyContacts] = useState(user?.emergencyContacts || []);

  // Location state
  const [locationPermission, setLocationPermission] = useState('unknown');
  const [currentLocation, setCurrentLocation] = useState(null);

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

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        return false;
      }

      // Check current permission status
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);

        if (permission.state === 'granted') {
          return true;
        } else if (permission.state === 'denied') {
          toast.error('Location permission denied. Please enable location access in browser settings.');
          return false;
        }
      }

      // Request permission by trying to get location
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationPermission('granted');
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            resolve(true);
          },
          (error) => {
            console.error('Location error:', error);
            setLocationPermission('denied');
            if (error.code === error.PERMISSION_DENIED) {
              toast.error('Location permission denied. Please enable location access.');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              toast.error('Location information unavailable.');
            } else if (error.code === error.TIMEOUT) {
              toast.error('Location request timed out.');
            }
            resolve(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
    } catch (error) {
      console.error('Permission request error:', error);
      toast.error('Failed to request location permission');
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  // Send current location to server
  const sendLocationToServer = async (location) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/receive`, {
        accelerometer: { x: 0, y: 0, z: 9.8 },
        gyroscope: { x: 0, y: 0, z: 0 },
        latitude: location.latitude,
        longitude: location.longitude,
        heartRate: 75,
        temperature: 36.5,
        batteryLevel: 85
      }, {
        headers: { 'x-auth-token': token }
      });
      console.log('Location sent to server:', response.data);
    } catch (error) {
      console.error('Failed to send location to server:', error);
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

      // Request location permission and get current location
      toast.loading('Getting your location...', { id: 'location-share' });

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        toast.error('Location permission required for emergency sharing', { id: 'location-share' });
        return;
      }

      // Get current location
      let location;
      try {
        location = await getCurrentLocation();
        console.log('Current location:', location);

        // Send location to server so it's available for emergency sharing
        await sendLocationToServer(location);

        toast.loading('Sending emergency location SMS...', { id: 'location-share' });
      } catch (locationError) {
        console.error('Failed to get location:', locationError);
        toast.error('Failed to get your current location', { id: 'location-share' });
        return;
      }

      let response;
      try {
        // Try the real endpoint first
        response = await axios.post(`${API_BASE_URL}/api/emergency/share-location`, {}, {
          headers: { 'x-auth-token': token }
        });
      } catch (mainError) {
        // If Twilio is not configured, try the test endpoint
        if (mainError.response?.status === 503 && mainError.response?.data?.message?.includes('SMS service is not configured')) {
          console.log('Twilio not configured, using test mode...');
          toast.loading('SMS service not configured. Using test mode...', { id: 'location-share' });

          response = await axios.post(`${API_BASE_URL}/api/emergency/share-location-test`, {}, {
            headers: { 'x-auth-token': token }
          });
        } else {
          throw mainError; // Re-throw if it's a different error
        }
      }

      const { results, errors, summary, testMode } = response.data;

      if (summary.successful > 0) {
        const modeText = testMode ? ' (TEST MODE - No actual SMS sent)' : '';
        toast.success(
          `Location shared successfully! ${summary.successful}/${summary.totalContacts} contacts notified.${modeText}`,
          { id: 'location-share', duration: 5000 }
        );

        // Log successful contacts
        results.forEach(result => {
          const statusText = testMode ? '[SIMULATED]' : '';
          console.log(`✅ ${statusText} SMS sent to ${result.contact}: ${result.messageSid}`);
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }}>
      <div className="container py-20">
        {/* Hero Header */}
        <div className="relative mb-16">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-blue-500/5 to-red-500/10 rounded-3xl blur-2xl"></div>

          <div className="relative" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '40px'
          }}>
            <div className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                  {/* Main shield container */}
                  <div className="relative w-28 h-28 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                    {/* Inner highlight */}
                    <div className="absolute inset-2 bg-gradient-to-br from-white/25 to-transparent rounded-2xl"></div>

                    {/* Shield icon with glow */}
                    <Shield className="w-16 h-16 text-white relative z-10 drop-shadow-2xl group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-500" />

                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-3xl transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                  </div>

                  {/* Status indicator with enhanced styling */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-xl">
                    <div className="w-5 h-5 bg-white rounded-full shadow-inner"></div>
                    {/* Pulse rings */}
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-40"></div>
                    <div className="absolute inset-1 bg-green-300 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                  </div>

                  {/* Floating particles effect */}
                  <div className="absolute -inset-6 pointer-events-none">
                    <div className="absolute top-3 left-3 w-2 h-2 bg-red-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0s', animationDuration: '2.5s' }}></div>
                    <div className="absolute top-6 right-2 w-1.5 h-1.5 bg-red-300 rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.8s', animationDuration: '3s' }}></div>
                    <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1.2s', animationDuration: '2.8s' }}></div>
                    <div className="absolute bottom-2 right-4 w-1 h-1 bg-red-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '1.8s', animationDuration: '3.2s' }}></div>
                  </div>
                </div>
                <div>
                  <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #ef4444 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-1px',
                    lineHeight: '1.1'
                  }}>
                    Welcome back, {currentUser?.name || 'User'}!
                  </h1>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '1.25rem',
                    fontWeight: '400',
                    opacity: '0.9'
                  }}>
                    Your Smart Safety Band Dashboard
                  </p>
                </div>
              </div>
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
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Edit3 className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-12">
        {/* WhatsApp Integration */}
        <WhatsAppManager />

        {/* Voice-Activated SOS */}
        <VoiceSOS />

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                  position: 'relative'
                }}>
                  <Wifi className="w-8 h-8 text-white" />
                  <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                </div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: 'white',
                  letterSpacing: '-0.5px'
                }}>Device Status</h2>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '50px',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span style={{
                  color: '#4ade80',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {deviceStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span style={{
                    color: '#d1d5db',
                    fontSize: '1.1rem',
                    fontWeight: '500'
                  }}>Last Sync</span>
                </div>
                <span style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.1rem'
                }}>{deviceStatus.lastSync}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Battery className="w-6 h-6 text-white" />
                  </div>
                  <span style={{
                    color: '#d1d5db',
                    fontSize: '1.1rem',
                    fontWeight: '500'
                  }}>Battery Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '60px',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '85%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <span style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Actions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
                position: 'relative'
              }}>
                <AlertTriangle className="w-8 h-8 text-white" />
                <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.5px'
              }}>Emergency Actions</h2>
            </div>

            <button
              onClick={handleShareLocation}
              style={{
                width: '100%',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div className="flex items-center gap-6 relative z-10">
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <MapPin className="w-8 h-8 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.25rem',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🚨 Share Location
                  </div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}>
                    Send emergency SMS with location to all contacts
                    {locationPermission === 'granted' && currentLocation && (
                      <span style={{ color: '#4ade80', marginLeft: '8px', fontWeight: '600' }}>📍 Location Ready</span>
                    )}
                    {locationPermission === 'denied' && (
                      <span style={{ color: '#f87171', marginLeft: '8px', fontWeight: '600' }}>❌ Location Denied</span>
                    )}
                    {locationPermission === 'unknown' && (
                      <span style={{ color: '#fbbf24', marginLeft: '8px', fontWeight: '600' }}>⚠️ Location Permission Needed</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 opacity-0 transition-opacity duration-300 pointer-events-none"></div>
            </button>
          </div>
        </div>

        {/* ESP32 Sensor Data Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          transition: 'all 0.4s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        }}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between mb-10 flex-wrap gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                position: 'relative'
              }}>
                <Smartphone className="w-10 h-10 text-white" />
                <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
              <div>
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '8px',
                  letterSpacing: '-1px'
                }}>ESP32 Sensor Data</h2>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '1.1rem',
                  fontWeight: '400'
                }}>Real-time device monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/sensor-data"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: '500',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <TrendingUp className="w-4 h-4" />
                See All Readings
              </Link>
              <Link
                to="/voice-sos-test"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.3)'
                }}
              >
                <AlertTriangle className="w-4 h-4" />
                🚨 Test Voice SOS
              </Link>
              {sensorData.dataRetentionInfo && (
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  Auto-delete after {sensorData.dataRetentionInfo.retentionPeriod}
                </div>
              )}
            </div>
          </div>

          {!sensorData.latest ? (
            <div className="text-center py-20 relative z-10">
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                position: 'relative'
              }}>
                <Smartphone className="w-16 h-16 text-gray-300" />
                <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              </div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>No Sensor Data</h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '1.1rem',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px auto',
                lineHeight: '1.6'
              }}>
                No ESP32 data received yet. Make sure your device is connected and sending data.
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <div style={{ color: '#9ca3af', textAlign: 'left' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>ESP32 should send data to: </span>
                    <code style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      color: '#60a5fa',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>POST /receive</code>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    <span style={{ color: '#d1d5db', fontWeight: '600', fontSize: '15px' }}>Expected format:</span><br />
                    <code className="text-green-400 text-sm font-mono">{"{"}"accelerometer": {"{"}"x": 1.2, "y": -0.5, "z": 9.8{"}"}, "gyroscope": {"{"}"x": 10, "y": -5, "z": 2{"}"}, "latitude": 28.6118, "longitude": 77.0378{"}"}</code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Latest Sensor Readings */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                  Latest Sensor Readings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Accelerometer */}
                  {sensorData.latest.accelerometer && (
                    <div className="glass p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <span className="font-semibold text-gray-300">Accelerometer</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-3">
                        {sensorData.latest.totalAcceleration?.toFixed(2) || '0.00'}g
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>X: {sensorData.latest.accelerometer.x.toFixed(2)}g</div>
                        <div>Y: {sensorData.latest.accelerometer.y.toFixed(2)}g</div>
                        <div>Z: {sensorData.latest.accelerometer.z.toFixed(2)}g</div>
                      </div>
                    </div>
                  )}

                  {/* Gyroscope */}
                  {sensorData.latest.gyroscope && (
                    <div className="glass p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="font-semibold text-gray-300">Gyroscope</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-3">
                        {sensorData.latest.totalRotation?.toFixed(2) || '0.00'}°/s
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>X: {sensorData.latest.gyroscope.x.toFixed(2)}°/s</div>
                        <div>Y: {sensorData.latest.gyroscope.y.toFixed(2)}°/s</div>
                        <div>Z: {sensorData.latest.gyroscope.z.toFixed(2)}°/s</div>
                      </div>
                    </div>
                  )}

                  {/* Latitude */}
                  {sensorData.latest.location && (
                    <div className="glass p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-6 h-6 text-green-400" />
                        <span className="font-semibold text-gray-300">Latitude</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-3">
                        {sensorData.latest.location.latitude.toFixed(6)}°
                      </div>
                      <div className="text-sm text-gray-400">
                        North/South Position
                      </div>
                    </div>
                  )}

                  {/* Longitude */}
                  {sensorData.latest.location && (
                    <div className="glass p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-6 h-6 text-green-400" />
                        <span className="font-semibold text-gray-300">Longitude</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-3">
                        {sensorData.latest.location.longitude.toFixed(6)}°
                      </div>
                      <div className="text-sm text-gray-400">
                        East/West Position
                      </div>
                    </div>
                  )}
                </div>

                {/* Show message if no sensor data */}
                {(!sensorData.latest.accelerometer && !sensorData.latest.gyroscope && !sensorData.latest.location) && (
                  <div className="glass p-8 rounded-xl text-center col-span-full">
                    <Smartphone className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                    <div className="text-gray-400 text-lg">No sensor data available</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency Contacts */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Emergency Contacts</h2>
              </div>
              <button
                onClick={handleAddContact}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
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
          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Safety Score</h2>
            </div>

            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">95</span>
              </div>
              <div className="text-green-400 font-bold text-xl mb-2">Excellent</div>
              <div className="text-gray-400">
                Your safety setup is optimized and ready for emergencies.
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 glass rounded-lg">
                <span className="text-gray-300">Device Connection</span>
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div className="flex justify-between items-center p-3 glass rounded-lg">
                <span className="text-gray-300">Emergency Contacts</span>
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div className="flex justify-between items-center p-3 glass rounded-lg">
                <span className="text-gray-300">Location Services</span>
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div className="flex justify-between items-center p-3 glass rounded-lg">
                <span className="text-gray-300">System Status</span>
                <span className="text-green-400 text-xl">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>
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

  );
};

export default Dashboard;