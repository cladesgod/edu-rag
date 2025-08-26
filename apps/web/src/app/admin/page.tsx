"use client"

import { useEffect, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

type User = { id: number; email: string; role: "admin" | "tutor" | "student"; created_at: string }

export default function AdminPage() {
  const API = getApiBase()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

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
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users"))
  }, [API])

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
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


