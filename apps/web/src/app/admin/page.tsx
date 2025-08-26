"use client"

import { useEffect, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken, getEmail } from "@/lib/auth"

type User = { id: number; email: string; role: "admin" | "tutor" | "student"; created_at: string }

export default function AdminPage() {
  const API = getApiBase()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [resetUserId, setResetUserId] = useState<number | null>(null)
  const [resetPassword, setResetPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const currentEmail = typeof window !== 'undefined' ? (getEmail() || "") : ""

  const authHeaders = () => {
    const t = getToken()
    return { Authorization: `Bearer ${t}` }
  }

  const load = () => {
    fetch(`${API}/admin/users`, { headers: authHeaders() })
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
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
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

  const doResetPassword = async (userId: number) => {
    if (!resetPassword || resetPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    try {
      setBusy(true)
      setError(null)
      const res = await fetch(`${API}/admin/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ password: resetPassword })
      })
      if (!res.ok) {
        let msg = "Failed to reset password"
        try { const j = await res.json(); msg = (j as any)?.detail || msg } catch {}
        throw new Error(msg)
      }
      setResetUserId(null)
      setResetPassword("")
    } catch (e: any) {
      setError(e?.message || "Failed to reset password")
    } finally {
      setBusy(false)
    }
  }

  const doDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Delete user ${userEmail}? This cannot be undone.`)) return
    try {
      setBusy(true)
      setError(null)
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders()
      })
      if (!res.ok) throw new Error("Failed to delete user")
      load()
    } catch (e: any) {
      setError(e?.message || "Failed to delete user")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
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
            <th className="text-left p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">{new Date(u.created_at).toLocaleString()}</td>
              <td className="p-2 border">
                {resetUserId === u.id ? (
                  <div className="flex gap-2 items-center">
                    <input type="password" className="border rounded px-2 py-1" placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
                    <button className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50" disabled={busy} onClick={() => doResetPassword(u.id)}>Save</button>
                    <button className="px-3 py-1 rounded border" onClick={() => { setResetUserId(null); setResetPassword("") }}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded border" onClick={() => { setResetUserId(u.id); setResetPassword("") }}>Reset Password</button>
                    <button className="px-2 py-1 rounded border text-red-700 disabled:opacity-50" disabled={busy || u.email === currentEmail} onClick={() => doDeleteUser(u.id, u.email)}>Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="p-2 border" colSpan={5}>No users yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}


