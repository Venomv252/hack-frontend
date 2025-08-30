import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  const heroStyle = {
    position: 'relative',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'center',
    overflow: 'hidden',
    background: '#000000',
    paddingTop: '80px'
  }

  const containerStyle = {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center'
  }

  const leftContentStyle = {
    textAlign: 'left'
  }

  const titleStyle = {
    fontSize: '56px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '24px',
    lineHeight: '1.1',
    fontFamily: 'Inter, sans-serif'
  }

  const descriptionStyle = {
    fontSize: '18px',
    color: '#9ca3af',
    marginBottom: '32px',
    lineHeight: '1.6',
    maxWidth: '480px',
    fontFamily: 'Inter, sans-serif'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
    border: 'none',
    cursor: 'pointer'
  }

  const imageContainerStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  const imageStyle = {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    aspectRatio: '4/3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }

  const watchImageStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
      linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)
    `,
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const wristStyle = {
    position: 'absolute',
    bottom: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '70%',
    height: '25%',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '50px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  }

  const bandStyle = {
    position: 'absolute',
    bottom: '25%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '8%',
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const watchFaceStyle = {
    width: '80px',
    height: '60px',
    background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
    borderRadius: '12px',
    border: '3px solid #374151',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  }

  const timeStyle = {
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: '2px'
  }



  const statusDotStyle = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '6px',
    height: '6px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  }

  const backgroundBlurStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '30%',
    background: `
      linear-gradient(135deg, 
        rgba(156, 163, 175, 0.4) 0%, 
        rgba(107, 114, 128, 0.3) 50%,
        rgba(75, 85, 99, 0.2) 100%
      )
    `,
    borderRadius: '20px 20px 0 0',
    backdropFilter: 'blur(3px)'
  }

  const officeElement1Style = {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '60px',
    height: '40px',
    background: 'rgba(59, 130, 246, 0.4)',
    borderRadius: '8px',
    filter: 'blur(2px)'
  }

  const officeElement2Style = {
    position: 'absolute',
    top: '20%',
    right: '20%',
    width: '40px',
    height: '40px',
    background: 'rgba(239, 68, 68, 0.4)',
    borderRadius: '50%',
    filter: 'blur(2px)'
  }

  const personSilhouetteStyle = {
    position: 'absolute',
    top: '10%',
    right: '25%',
    width: '80px',
    height: '120px',
    background: 'rgba(75, 85, 99, 0.6)',
    borderRadius: '40px 40px 20px 20px',
    filter: 'blur(3px)'
  }

  return (
    <section style={heroStyle}>
      <div style={containerStyle}>
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={leftContentStyle}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={titleStyle}
          >
            Your Guardian on the Go: The Smart Safety Band
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={descriptionStyle}
          >
            A low-cost, wearable device engineered to save lives during accidents, harassment, and health emergencies. Stay connected, stay safe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              to="/register"
              style={buttonStyle}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #3730a3 0%, #312e81 100%)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Discover Safety
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Product Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={imageContainerStyle}
        >
          <div style={imageStyle}>
            <div style={watchImageStyle}>
              {/* Background blur effect for office environment */}
              <div style={backgroundBlurStyle} />

              {/* Office environment elements */}
              <div style={officeElement1Style} />
              <div style={officeElement2Style} />
              <div style={personSilhouetteStyle} />

              {/* Wrist/arm */}
              <div style={wristStyle} />

              {/* Smart Safety Band */}
              <div style={bandStyle}>
                {/* Watch face */}
                <div style={watchFaceStyle}>
                  {/* Screen display */}
                  <div style={timeStyle}>18:19</div>

                  {/* Status indicator */}
                  <div style={statusDotStyle} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .hero-title {
            font-size: 48px;
          }
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }
          .hero-description {
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  )
}

export default HeroSection