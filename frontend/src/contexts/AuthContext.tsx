import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { authApi } from '../services/api'
import { getToken, getUser, setToken, setUser, removeToken, removeUser, isLoggedIn } from '../utils/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getToken()
      const savedUser = getUser()

      if (savedToken && savedUser) {
        try {
          const response = await authApi.getCurrentUser()
          setUserState(response.data)
          setTokenState(savedToken)
        } catch {
          removeToken()
          removeUser()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    setTokenState(newToken)
    setUserState(newUser)
  }

  const logout = () => {
    removeToken()
    removeUser()
    setTokenState(null)
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
