import { createContext, useContext, useEffect, useState } from "react"
import { api, clearToken, getToken, setToken } from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // On page load: if a token is saved, ask the backend who we are
  useEffect(() => {
    async function loadUser() {
      if (!getToken()) {
        setChecking(false)
        return
      }
      try {
        const data = await api("/auth/me")
        setUser(data.user)
      } catch {
        clearToken()
      } finally {
        setChecking(false)
      }
    }
    loadUser()
  }, [])

  // If any request gets a 401 (expired token), log out everywhere
  useEffect(() => {
    function handleLogout() {
      setUser(null)
    }
    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [])

  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: { email, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", { method: "POST", body: { name, email, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  const value = {
    user,
    checking,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}