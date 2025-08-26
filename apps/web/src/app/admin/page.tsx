"use client"

import { useEffect, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

type User = { id: number; email: string; role: "admin" | "tutor" | "student"; created_at: string }

export default function AdminPage() {
  const API = getApiBase()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [creating, setCreating] = useState(false)

  const load = () => {
    const token = getToken()
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users"))
  }

  useEffect(() => {
    const role = getRole()
    if (role !== "admin") {
      window.location.href = "/login"
      return
    }
    const token = getToken()
    if (!token) {
      window.location.href = "/login"
      return
    }
    load()
  }, [API])

  const createTutor = async () => {
    if (!email || !password) return
    try {
      setCreating(true)
      setError(null)
      const token = getToken()
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, password, role: "tutor" })
      })
      if (!res.ok) {
        let msg = "Failed to create tutor"
        try {
          const j = await res.json() as any
          if (typeof j?.detail === "string") msg = j.detail
          else if (Array.isArray(j?.detail)) msg = j.detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; ")
          else msg = JSON.stringify(j)
        } catch {
          try { msg = await res.text() } catch {}
        }
        throw new Error(msg)
      }
      setEmail("")
      setPassword("")
      load()
    } catch (e: any) {
      setError(e?.message || "Failed to create tutor")
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="border rounded p-4 space-y-2">
        <h2 className="font-semibold">Create Tutor</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="border rounded px-2 py-1" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="border rounded px-2 py-1" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          <button className="bg-black text-white px-3 py-1 rounded disabled:opacity-50" disabled={creating} onClick={createTutor}>{creating ? "Creating..." : "Create Tutor"}</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">ID</th>
            <th className="text-left p-2 border">Email</th>
            <th className="text-left p-2 border">Role</th>
            <th className="text-left p-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="p-2 border" colSpan={4}>No users yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}


