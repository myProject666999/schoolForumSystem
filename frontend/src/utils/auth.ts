import type { User } from '../types'

export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

export const setToken = (token: string): void => {
  localStorage.setItem('token', token)
}

export const removeToken = (): void => {
  localStorage.removeItem('token')
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const removeUser = (): void => {
  localStorage.removeItem('user')
}

export const isLoggedIn = (): boolean => {
  return !!getToken()
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.role === 'admin'
}

export const logout = (): void => {
  removeToken()
  removeUser()
}
