import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { authApi } from "../services/schoolApi"

const AuthContext = createContext(null)

const getStoredToken = () => localStorage.getItem("auth_token")
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "null")
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser)

  useEffect(() => {
    if (!getStoredToken()) return
    authApi.me().then((current) => {
      setUser(current)
      localStorage.setItem("auth_user", JSON.stringify(current))
    }).catch(() => {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      setUser(null)
    })
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors; clear local session regardless.
    }
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(getStoredToken() && user),
      user,
      login,
      logout,
      setUser,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
