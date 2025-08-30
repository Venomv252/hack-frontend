import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Features from './pages/Features'
import Dashboard from './pages/Dashboard'
import ActivityLog from './pages/ActivityLog'
import SensorData from './pages/SensorData'
import VoiceSOSTest from './pages/VoiceSOSTest'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/voice-sos-test" element={<VoiceSOSTest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App