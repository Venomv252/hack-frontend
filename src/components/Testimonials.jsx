import React from 'react'
import { motion } from 'framer-motion'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      content: 'The Smart Safety Band gave me peace of mind when my elderly mother started living alone. The fall detection feature is a lifesaver!',
      avatar: 'SC'
    },
    {
      name: 'Mark Johnson',
      content: 'As an avid hiker, the SOS alert feature is invaluable. It\'s comforting to know I can call for help even in remote areas.',
      avatar: 'MJ'
    },
    {
      name: 'Priya Sharma',
      content: 'I bought this for my daughter for college. The location sharing and harassment alert features make me feel so much better about her safety.',
      avatar: 'PS'
    }
  ]

  const sectionStyle = {
    padding: '80px 0',
    background: '#000000',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center'
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  }

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '60px'
  }

  const mainTitleStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0',
    fontFamily: 'Inter, sans-serif',
    lineHeight: '1.2'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto'
  }

  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(51, 65, 85, 0.4)',
    borderRadius: '20px',
    padding: '32px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column'
  }

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '24px',
    fontFamily: 'Inter, sans-serif'
  }

  const quoteStyle = {
    fontSize: '16px',
    color: '#d1d5db',
    lineHeight: '1.6',
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'italic',
    marginBottom: '24px',
    flex: 1
  }

  const authorStyle = {
    fontSize: '14px',
    color: '#9ca3af',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="testimonials" style={sectionStyle}>
      <div style={containerStyle}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={titleStyle}
        >
          <h2 style={mainTitleStyle}>
            What Our Users Say
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={gridStyle}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <div 
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px)'
                  e.target.style.borderColor = 'rgba(71, 85, 105, 0.6)'
                  e.target.style.background = 'rgba(30, 41, 59, 0.9)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.4)'
                  e.target.style.background = 'rgba(30, 41, 59, 0.8)'
                }}
              >
                {/* Avatar */}
                <div style={avatarStyle}>
                  {testimonial.avatar}
                </div>

                {/* Quote */}
                <p style={quoteStyle}>
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div style={authorStyle}>
                  - {testimonial.name}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }
        
        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .main-title {
            font-size: 36px;
          }
          .testimonial-card {
            min-height: 240px;
            padding: 24px;
          }
        }
      `}</style>
    </section>
  )
}

export default Testimonials