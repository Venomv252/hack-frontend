import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Shield, Zap, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const CTASection = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSignup = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      toast.success('Successfully subscribed to updates!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    }
  }

  const benefits = [
    { icon: Shield, text: 'Advanced Safety Features' },
    { icon: Zap, text: 'Instant Emergency Response' },
    { icon: MapPin, text: 'Real-time Location Tracking' }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Stay Safe?{' '}
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Pre-Order Now
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of users who trust Smart Safety Band for their personal safety. 
              Be among the first to experience next-generation wearable safety technology.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="btn-primary inline-flex items-center justify-center group"
              >
                Pre-Order Now - ₹7,999
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/features"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Free shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>1-year warranty</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                Stay Updated
              </h3>
              
              <p className="text-gray-300 mb-6">
                Get notified about product updates, safety tips, and exclusive early-bird offers.
              </p>

              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSignup} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    Get Early Access
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-green-400 font-semibold">
                    Thank you for subscribing!
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    You'll be the first to know about updates.
                  </p>
                </div>
              )}

              <div className="mt-6 text-xs text-gray-500">
                No spam, unsubscribe at any time
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-red-500/20 rounded-full"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500/20 rounded-full"
            />
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-300 text-sm">
              Limited time: Early bird pricing available
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection