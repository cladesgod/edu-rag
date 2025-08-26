"use client"

import { useState } from "react"
import { getApiBase } from "@/lib/api"
import { setToken, decodeToken } from "@/lib/auth"

export default function RegisterPage() {
  const API = getApiBase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "student" }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || "register failed")
      }
      const data = await res.json()
      if (data?.access_token) {
        setToken(data.access_token)
        const payload = decodeToken(data.access_token)
        if (payload?.role === "student") {
          window.location.href = "/ws"
          return
        }
        window.location.href = "/"
      } else {
        throw new Error("no token")
      }
    } catch (err) {
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Student Registration</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="border rounded px-3 py-2 w-full"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white px-3 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register as Student"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
      <p className="text-sm text-gray-600">Tutors are added by admins.</p>
    </main>
  )
}
