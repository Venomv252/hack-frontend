import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assests/ChatGPT Image Aug 28, 2025, 11_04_05 AM.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Contact', href: '/contact' }
  ]

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
    background: 'rgba(2, 6, 23, 0.95)',
    backdropFilter: 'blur(15px)',
    padding: '14px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'white'
  }

  const logoIconStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3b82f6',
    fontFamily: 'serif'
  }

  const logoTextStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '-0.5px'
  }

  const navLinksStyle = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: '32px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)'
  }

  const linkStyle = {
    color: '#d1d5db',
    textDecoration: 'none',
    fontWeight: '400',
    fontSize: '15px',
    transition: 'color 0.3s ease',
    fontFamily: 'Inter, sans-serif'
  }

  const authButtonsStyle = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }

  const loginButtonStyle = {
    color: '#d1d5db',
    textDecoration: 'none',
    fontWeight: '400',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
    padding: '8px 16px',
    borderRadius: '6px'
  }

  const getStartedButtonStyle = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
    border: 'none',
    cursor: 'pointer'
  }

  const mobileMenuStyle = {
    display: isOpen ? 'block' : 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'rgba(2, 6, 23, 0.98)',
    backdropFilter: 'blur(15px)',
    padding: '20px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
  }

  const mobileMenuItemStyle = {
    display: 'block',
    color: '#d1d5db',
    textDecoration: 'none',
    padding: '12px 0',
    fontSize: '16px',
    fontWeight: '400',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'color 0.3s ease'
  }

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <Link to="/" style={logoStyle} className="navbar-logo">
          <img 
            src={logo} 
            alt="SOSWear Logo" 
            style={{ 
              height: '42px', 
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }} 
          />
          <span style={logoTextStyle}>SOSWear</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div style={navLinksStyle}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              style={linkStyle}
              onMouseOver={(e) => e.target.style.color = 'white'}
              onMouseOut={(e) => e.target.style.color = '#d1d5db'}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons - Grouped together */}
        <div style={authButtonsStyle} className="navbar-auth-group">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={loginButtonStyle}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#d1d5db'}
              >
                Dashboard
              </Link>
              <Link
                to="/sensor-data"
                style={loginButtonStyle}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#d1d5db'}
              >
                Sensors
              </Link>
              <button
                onClick={handleLogout}
                style={getStartedButtonStyle}
                onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'}
                onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={loginButtonStyle}
                onMouseOver={(e) => {
                  e.target.style.color = 'white'
                  e.target.style.background = 'rgba(255, 255, 255, 0.0)'
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#d1d5db'
                  e.target.style.background = 'transparent'
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={getStartedButtonStyle}
                onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'}
                onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ 
              color: '#d1d5db', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div style={mobileMenuStyle}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                style={mobileMenuItemStyle}
                onClick={() => setIsOpen(false)}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#d1d5db'}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  style={mobileMenuItemStyle}
                  onClick={() => setIsOpen(false)}
                  onMouseOver={(e) => e.target.style.color = 'white'}
                  onMouseOut={(e) => e.target.style.color = '#d1d5db'}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  style={{
                    ...mobileMenuItemStyle,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={mobileMenuItemStyle}
                  onClick={() => setIsOpen(false)}
                  onMouseOver={(e) => e.target.style.color = 'white'}
                  onMouseOut={(e) => e.target.style.color = '#d1d5db'}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    ...mobileMenuItemStyle,
                    color: '#3b82f6',
                    fontWeight: '500'
                  }}
                  onClick={() => setIsOpen(false)}
                  onMouseOver={(e) => e.target.style.color = '#2563eb'}
                  onMouseOut={(e) => e.target.style.color = '#3b82f6'}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar