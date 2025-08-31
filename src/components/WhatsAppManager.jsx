import React, { useState, useEffect } from 'react';
import { MessageCircle, Wifi, WifiOff, QrCode, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const WhatsAppManager = () => {
  const [whatsappStatus, setWhatsappStatus] = useState({
    isConnected: false,
    connectionState: 'disconnected',
    qrCode: null
  });
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    checkWhatsAppStatus();
    
    // Check status every 10 seconds
    const interval = setInterval(checkWhatsAppStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/whatsapp/status`, {
        headers: { 'x-auth-token': token }
      });

      setWhatsappStatus(response.data);
      
      // Show QR code if available
      if (response.data.qrCode && response.data.connectionState === 'qr_generated') {
        setShowQR(true);
      } else if (response.data.isConnected) {
        setShowQR(false);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };

  const connectWhatsApp = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp/connect`, {}, {
        headers: { 'x-auth-token': token }
      });

      if (response.data.success) {
        toast.success('WhatsApp connection initiated. Please scan the QR code.');
        setShowQR(true);
        // Check status more frequently while connecting
        const quickCheck = setInterval(() => {
          checkWhatsAppStatus();
        }, 2000);
        
        // Stop quick checking after 2 minutes
        setTimeout(() => clearInterval(quickCheck), 120000);
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      toast.error('Failed to connect WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp/disconnect`, {}, {
        headers: { 'x-auth-token': token }
      });

      if (response.data.success) {
        toast.success('WhatsApp disconnected successfully');
        setWhatsappStatus({
          isConnected: false,
          connectionState: 'disconnected',
          qrCode: null
        });
        setShowQR(false);
      }
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Failed to disconnect WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (whatsappStatus.connectionState) {
      case 'connected': return '#10b981';
      case 'qr_generated': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (whatsappStatus.connectionState) {
      case 'connected': return 'Connected';
      case 'qr_generated': return 'Waiting for QR scan';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
          }}>
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '4px',
              letterSpacing: '-0.5px',
              paddingLeft:'20px'
            }}>WhatsApp Integration</h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem',
              fontWeight: '400',
              paddingLeft:'20px'
            }}>Connect your WhatsApp for emergency messaging</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{ 
              color: getStatusColor(),
              backgroundColor: `${getStatusColor()}20`,
              borderColor: `${getStatusColor()}30`
            }}
          >
            {whatsappStatus.isConnected ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <button
            onClick={checkWhatsAppStatus}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#9ca3af'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
              e.target.style.color = '#d1d5db'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#9ca3af'
            }}
            title="Refresh status"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && whatsappStatus.qrCode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-white"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappStatus.qrCode)}`}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-gray-300 text-sm">
                1. Open WhatsApp on your phone<br/>
                2. Go to Settings → Linked Devices<br/>
                3. Tap "Link a Device"<br/>
                4. Scan this QR code
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Status Information */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Connection Status</span>
            <span 
              className="text-sm font-medium"
              style={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </span>
          </div>
          
          {whatsappStatus.isConnected && (
            <div className="text-xs text-green-400">
              ✅ WhatsApp is ready for emergency messaging
            </div>
          )}
          
          {whatsappStatus.connectionState === 'qr_generated' && (
            <div className="text-xs text-yellow-400">
              ⏳ Waiting for you to scan the QR code with your phone
            </div>
          )}
          
          {whatsappStatus.connectionState === 'disconnected' && (
            <div className="text-xs text-red-400">
              ❌ WhatsApp not connected. Voice SOS will not work.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!whatsappStatus.isConnected ? (
            <button
              onClick={connectWhatsApp}
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? '#4b5563' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(34, 197, 94, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.3)'
                }
              }}
            >
              {loading ? (
                <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px' }} />
              ) : (
                <MessageCircle style={{ width: '16px', height: '16px' }} />
              )}
              Connect WhatsApp
            </button>
          ) : (
            <button
              onClick={disconnectWhatsApp}
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? '#4b5563' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.3)'
                }
              }}
            >
              {loading ? (
                <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px' }} />
              ) : (
                <WifiOff style={{ width: '16px', height: '16px' }} />
              )}
              Disconnect
            </button>
          )}
          
          {whatsappStatus.qrCode && (
            <button
              onClick={() => setShowQR(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              <QrCode style={{ width: '16px', height: '16px' }} />
              Show QR
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• WhatsApp connection is required for voice-activated SOS</p>
          <p>• Once connected, emergency messages will be sent via WhatsApp</p>
          <p>• Keep your phone connected to internet for reliable messaging</p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppManager;