"use client"

import { useState } from "react"
import { getApiBase } from "@/lib/api"
import { setToken, getRole } from "@/lib/auth"

export default function LoginPage() {
  const API = getApiBase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error("login failed")
      const data = await res.json()
      setToken(data.access_token)
      const role = getRole()
      if (role === "admin") window.location.href = "/admin"
      else if (role === "tutor") window.location.href = "/tutor"
      else window.location.href = "/student"
    } catch {
      setError("Invalid credentials")
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input className="border rounded px-2 py-1 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="border rounded px-2 py-1 w-full" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-black text-white px-3 py-1 rounded" onClick={submit}>Login</button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </main>
  )
}


