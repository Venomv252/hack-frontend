import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import VoiceSOS from '../components/VoiceSOS';
import WhatsAppManager from '../components/WhatsAppManager';

const VoiceSOSTest = () => {
  return (
    <div className="min-h-screen" style={{ paddingTop: '20px' }}>
      <div className="container py-16">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/dashboard" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft style={{ width: '24px', height: '24px' }} />
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Voice-Activated SOS Test
            </h1>
          </div>
          <p className="text-gray-400">
            Test the voice-activated emergency system with WhatsApp integration.
          </p>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
          {/* WhatsApp Setup */}
          <WhatsAppManager />

          {/* Voice SOS Component */}
          <VoiceSOS />

          {/* Instructions */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 className="text-xl font-semibold text-white mb-4">Testing Instructions</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Setup (Required)</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>First, connect WhatsApp using the manager above</li>
                  <li>Scan the QR code with your phone's WhatsApp</li>
                  <li>Wait for the connection status to show "Connected"</li>
                  <li>Make sure you have emergency contacts configured in your profile</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Voice Testing</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click "Start Voice Monitoring" in the Voice SOS section</li>
                  <li>Grant microphone permissions when prompted</li>
                  <li>Watch the audio level indicator</li>
                  <li>Scream loudly or make a loud noise to trigger the SOS</li>
                  <li>You'll have 5 seconds to cancel the SOS</li>
                  <li>If not cancelled, WhatsApp messages will be sent to your emergency contacts</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Manual Testing</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Use the "Test SOS" button to manually trigger the countdown</li>
                  <li>This simulates the voice detection without needing to scream</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">⚠️ Important Notes</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-300">
                  <li>This will send real WhatsApp messages to your emergency contacts</li>
                  <li>Make sure to inform your contacts that you're testing the system</li>
                  <li>The voice detection threshold can be adjusted in the component</li>
                  <li>Keep your phone connected to internet for WhatsApp to work</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSOSTest;