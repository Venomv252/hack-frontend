import React, { useState } from 'react';
import { Send, MessageCircle, User, Mail, FileText, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: '20px' }}>
      <div className="container py-16">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '32px' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <MessageCircle style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Get In Touch</h1>
              <p className="text-gray-400">Have questions about SOSWear? We're here to help you stay safe.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Name and Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                    Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '20px', 
                        height: '20px', 
                        color: '#9ca3af' 
                      }} 
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '20px', 
                        height: '20px', 
                        color: '#9ca3af' 
                      }} 
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                  Subject
                </label>
                <div style={{ position: 'relative' }}>
                  <FileText 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: '20px', 
                      height: '20px', 
                      color: '#9ca3af' 
                    }} 
                  />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="What's this about?"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                  Message
                </label>
                <div style={{ position: 'relative' }}>
                  <MessageSquare 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '16px', 
                      width: '20px', 
                      height: '20px', 
                      color: '#9ca3af' 
                    }} 
                  />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input"
                    style={{ 
                      paddingLeft: '40px', 
                      minHeight: '120px', 
                      resize: 'vertical',
                      paddingTop: '12px'
                    }}
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ 
                  width: '100%',
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send style={{ width: '16px', height: '16px' }} />
                    Send Message
                  </>
                )}
              </button>
            </form>

        
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;