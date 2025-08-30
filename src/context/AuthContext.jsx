import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'AUTH_ERROR':
      localStorage.removeItem('token')
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    token: localStorage.getItem('token'),
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  })

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['x-auth-token'] = state.token
    } else {
      delete axios.defaults.headers.common['x-auth-token']
    }
  }, [state.token])

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser()
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/users/profile')
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: state.token,
          user: res.data
        }
      })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message })
    }
  }

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check if it's demo login
      if (email === 'rahul.sharma@smartsafetyband.com' && password === 'demo123') {
        const res = await axios.post('/api/users/demo-login')
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: res.data
        })
        return { success: true }
      } else {
        const res = await axios.post('/api/users/login', { email, password })
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: res.data
        })
        return { success: true }
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message })
      return { success: false, error: error.response?.data?.message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const res = await axios.post('/api/users/register', userData)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message })
      return { success: false, error: error.response?.data?.message }
    }
  }

  const updateUser = async (userData) => {
    try {
      const res = await axios.put('/api/users/profile', userData)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: state.token,
          user: res.data
        }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      loadUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}