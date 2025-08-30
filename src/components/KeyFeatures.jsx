import React from 'react'

const KeyFeatures = () => {
  const features = [
    {
      icon: (
        <svg style={{ height: '32px', width: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718l8.485-8.485M6.343 6.343l8.485 8.485M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: 'Instant SOS Alerts',
      description: 'Send emergency signals to your trusted contacts with a single press, ensuring immediate help arrives.'
    },
    {
      icon: (
        <svg style={{ height: '32px', width: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Real-time Location Sharing',
      description: 'Share your precise location with family and friends during emergencies for quick and accurate response.'
    },
    {
      icon: (
        <svg style={{ height: '32px', width: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Advanced Fall Detection',
      description: 'Automatic detection of falls and immediate alerts to chosen contacts, vital for elderly or vulnerable users.'
    },
    {
      icon: (
        <svg style={{ height: '32px', width: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Continuous Health Monitoring',
      description: 'Track vital health metrics like heart rate and activity levels, providing insights and alerts for anomalies.'
    }
  ]

  const containerStyle = {
    padding: '64px 0',
    backgroundColor: '#111827',
    color: '#ffffff'
  }

  const innerContainerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px'
  }

  const titleContainerStyle = {
    textAlign: 'center',
    marginBottom: '64px'
  }

  const titleStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 16px 0'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(4, 1fr)'
    }
  }

  const cardStyle = {
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #374151',
    transition: 'border-color 0.3s ease',
    cursor: 'pointer'
  }

  const cardHoverStyle = {
    borderColor: '#14b8a6'
  }

  const iconContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64px',
    width: '64px',
    borderRadius: '50%',
    backgroundColor: '#374151',
    color: '#14b8a6',
    margin: '0 auto 24px auto'
  }

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  }

  const cardDescriptionStyle = {
    color: '#d1d5db',
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: '1.6'
  }

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        <div style={titleContainerStyle}>
          <h2 style={titleStyle}>
            Key Features to Keep You Safe
          </h2>
        </div>

        <div style={gridStyle}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              style={cardStyle}
              onMouseEnter={(e) => {
                e.target.style.borderColor = cardHoverStyle.borderColor
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#374151'
              }}
            >
              <div style={iconContainerStyle}>
                {feature.icon}
              </div>
              <h3 style={cardTitleStyle}>
                {feature.title}
              </h3>
              <p style={cardDescriptionStyle}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KeyFeatures