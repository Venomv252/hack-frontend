import React from 'react'
import { MapPin, Shield, Smartphone, Users, Clock, Droplets } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Instant SOS Alerts',
      description: 'Send emergency signals to your trusted contacts with a single press, ensuring immediate help arrives.',
      benefits: ['One-touch activation', 'GPS location sharing', 'Multiple contact alerts', 'Silent mode available']
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Real-time Location Sharing',
      description: 'Share your precise location with family and friends during emergencies for quick and accurate response.',
      benefits: ['Live GPS tracking', 'Location history', 'Geofencing alerts', 'Battery-efficient tracking']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Advanced Fall Detection',
      description: 'Automatic detection of falls and immediate alerts to chosen contacts, vital for elderly or vulnerable users.',
      benefits: ['AI-powered detection', 'False alarm prevention', 'Customizable sensitivity', 'Medical alert integration']
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Smart Connectivity',
      description: 'Seamless integration with your smartphone and smart home devices for comprehensive safety coverage.',
      benefits: ['Mobile app control', 'Smart home integration', 'Voice commands', 'Cloud synchronization']
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Monitoring',
      description: 'Round-the-clock monitoring and support with professional emergency response services.',
      benefits: ['Professional monitoring', '24/7 support', 'Emergency dispatch', 'Medical history access']
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: 'Waterproof Design',
      description: 'Built to withstand any weather condition with IP68 waterproof rating for ultimate durability.',
      benefits: ['IP68 water resistance', 'Dust protection', 'Extreme weather ready', 'Long-lasting durability']
    }
  ]

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      paddingTop: '20px',
      paddingBottom: '35px'
    }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20" style={{ paddingBottom: "50px" }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px'
          }}>
            Smart Safety Features
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#9ca3af',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.7',
            fontWeight: '400'
          }}>
            Advanced technology designed to keep you safe and connected at all times.
            Discover how SOSWear revolutionizes personal safety with cutting-edge features.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
          marginBottom: '80px',
          maxWidth: '1400px',
          margin: '0 auto 80px auto'
        }}
          className="features-grid"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px',
                transition: 'all 0.4s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {feature.title}
              </h3>

              {/* Description */}
              <p style={{
                color: '#d1d5db',
                marginBottom: '24px',
                lineHeight: '1.6',
                fontSize: '15px'
              }}>
                {feature.description}
              </p>

              {/* Benefits */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#e5e7eb',
                    fontSize: '14px',
                    marginBottom: '8px',
                    fontWeight: '400'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#ef4444',
                      borderRadius: '50%',
                      marginRight: '12px',
                      flexShrink: 0
                    }}></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '24px',
            padding: '48px 32px',
            backdropFilter: 'blur(15px)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              Ready to Experience Ultimate Safety?
            </h2>
            <p style={{
              color: '#d1d5db',
              marginBottom: '32px',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Join thousands of users who trust SOSWear for their personal safety.
              Get started today and experience peace of mind like never before.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <a
                href="/register"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 10px 30px rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                Get Started Now
              </a>
              <a
                href="/contact"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#e5e7eb',
                  fontWeight: '500',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.target.style.color = 'white'
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.target.style.color = '#e5e7eb'
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features