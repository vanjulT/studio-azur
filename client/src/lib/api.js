const API_URL = import.meta.env.VITE_API_URL
const TOKEN_KEY = "studio-azur-token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error("Cannot reach the server. Please check your connection and try again.")
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new Event("auth:logout"))
    }
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
}