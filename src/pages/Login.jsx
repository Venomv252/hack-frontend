import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: '20px' }}>
      <div className="container py-16">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
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
                <Shield style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Smart Safety Band account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                  Email Address
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
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-300" style={{ display: 'block', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock 
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
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      color: '#9ca3af', 
                      cursor: 'pointer' 
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div style={{ textAlign: 'right' }}>
                <Link
                  to="/forgot-password"
                  className="text-sm text-red-400 transition-all"
                  style={{ textDecoration: 'none' }}
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ 
                  width: '100%',
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center" style={{ margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
              <span className="text-gray-400 text-sm" style={{ padding: '0 16px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-red-400 font-medium transition-all"
                  style={{ textDecoration: 'none' }}
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Demo Account */}
            <div 
              style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px'
              }}
            >
              <p className="text-sm text-center" style={{ color: '#60a5fa', margin: 0 }}>
                <strong>Demo Account:</strong><br />
                Email: rahul.sharma@smartsafetyband.com<br />
                Password: demo123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;