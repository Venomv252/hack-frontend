import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, X, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const VoiceSOS = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Voice detection threshold (adjust based on testing)
  const SCREAM_THRESHOLD = 150; // Adjust this value based on testing
  const SUSTAINED_DURATION = 500; // milliseconds
  const sustainedLoudnessRef = useRef(0);

  useEffect(() => {
    return () => {
      stopListening();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Test if we can access the microphone
      const tracks = stream.getAudioTracks();
      if (tracks.length > 0) {
        setPermissionGranted(true);
        // Stop the test stream
        tracks.forEach(track => track.stop());
        toast.success('Microphone access granted!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast.error('Microphone access denied. Please enable microphone permissions.');
      return false;
    }
  };

  const startListening = async () => {
    if (!permissionGranted) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      toast.success('Voice monitoring started! Scream loudly to trigger SOS.');
      
      // Start analyzing audio
      analyzeAudio();
    } catch (error) {
      console.error('Error starting voice detection:', error);
      toast.error('Failed to start voice detection');
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (microphoneRef.current && microphoneRef.current.mediaStream) {
      microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsListening(false);
    setAudioLevel(0);
    sustainedLoudnessRef.current = 0;
    toast.success('Voice monitoring stopped');
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    
    setAudioLevel(average);

    // Check for sustained loud noise (screaming)
    if (average > SCREAM_THRESHOLD) {
      sustainedLoudnessRef.current += 50; // Assuming ~50ms per frame
      
      if (sustainedLoudnessRef.current >= SUSTAINED_DURATION && !isSOSActive) {
        triggerSOS();
      }
    } else {
      sustainedLoudnessRef.current = Math.max(0, sustainedLoudnessRef.current - 25);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const triggerSOS = () => {
    if (isSOSActive) return;

    setIsSOSActive(true);
    setCountdown(5);
    toast.error('🚨 LOUD SCREAM DETECTED! SOS will be sent in 5 seconds!', {
      duration: 5000,
      style: {
        background: '#ef4444',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    });

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          sendSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setIsSOSActive(false);
    setCountdown(5);
    toast.success('SOS cancelled successfully');
  };

  const sendSOS = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to send SOS');
        return;
      }

      toast.loading('Sending SOS via WhatsApp...', { id: 'sos-send' });

      // Send SOS via WhatsApp
      const response = await axios.post(`${API_BASE_URL}/api/emergency/voice-sos`, {
        trigger: 'voice_scream',
        audioLevel: audioLevel,
        timestamp: new Date().toISOString()
      }, {
        headers: { 'x-auth-token': token }
      });

      if (response.data.success) {
        toast.success('🚨 SOS sent successfully via WhatsApp!', { 
          id: 'sos-send',
          duration: 5000,
          style: {
            background: '#10b981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.error('Failed to send SOS: ' + response.data.message, { id: 'sos-send' });
      }

    } catch (error) {
      console.error('Error sending SOS:', error);
      toast.error('Failed to send SOS. Please try again.', { id: 'sos-send' });
    } finally {
      setIsSOSActive(false);
      setCountdown(5);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Voice-Activated SOS</h2>
            <p className="text-gray-400 text-lg">Emergency detection through voice monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isListening && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Listening</span>
            </div>
          )}
        </div>
      </div>

      {/* SOS Countdown Modal */}
      {isSOSActive && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-red-600 p-8 rounded-lg text-center max-w-md mx-4">
            <AlertTriangle className="mx-auto mb-4" style={{ width: '64px', height: '64px', color: 'white' }} />
            <h3 className="text-2xl font-bold text-white mb-4">🚨 SOS ALERT</h3>
            <p className="text-white mb-6">
              Loud scream detected! SOS will be sent via WhatsApp in:
            </p>
            <div className="text-6xl font-bold text-white mb-6 animate-pulse">
              {countdown}
            </div>
            <button
              onClick={cancelSOS}
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
            >
              <X style={{ width: '20px', height: '20px' }} />
              Cancel SOS
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Permission Status */}
        {!permissionGranted && (
          <div className="glass p-6 rounded-xl border border-yellow-500/30">
            <div className="flex items-center gap-3 text-yellow-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-semibold text-lg">Microphone Permission Required</span>
            </div>
            <p className="text-gray-300">
              Grant microphone access to enable voice-activated SOS functionality.
            </p>
          </div>
        )}

        {/* Audio Level Indicator */}
        {isListening && (
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 text-lg font-medium">Audio Level</span>
              <span className="text-white font-bold text-lg">{Math.round(audioLevel)}/255</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="h-4 rounded-full transition-all duration-100"
                style={{ 
                  width: `${(audioLevel / 255) * 100}%`,
                  background: audioLevel > SCREAM_THRESHOLD 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              />
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Quiet</span>
              <span className={audioLevel > SCREAM_THRESHOLD ? 'text-red-400 font-medium' : 'text-gray-400'}>
                Scream Threshold ({SCREAM_THRESHOLD})
              </span>
              <span>Loud</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-6">
          {!isListening ? (
            <button
              onClick={startListening}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Mic className="w-6 h-6" />
              Start Voice Monitoring
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <MicOff className="w-6 h-6" />
              Stop Voice Monitoring
            </button>
          )}

          <button
            onClick={triggerSOS}
            className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
          >
            <AlertTriangle className="w-6 h-6" />
            Test SOS
          </button>
        </div>

        {/* Instructions */}
        <div className="glass p-6 rounded-xl">
          <h4 className="text-white font-bold text-xl mb-4">How it works:</h4>
          <ul className="text-gray-300 space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Click "Start Voice Monitoring" to begin listening</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Scream loudly to trigger the SOS countdown</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>You have 5 seconds to cancel the SOS</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>If not cancelled, SOS will be sent via WhatsApp to all emergency contacts</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>The system detects sustained loud noise above {SCREAM_THRESHOLD} level</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceSOS;