"use client"

import { useEffect, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

type Active = { id: number; form_id: number; user_id: number; started_at: string }

export default function TutorMonitor() {
  const API = getApiBase()
  const [rows, setRows] = useState<Active[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const role = getRole()
    const token = getToken()
    if (!token || !(role === "tutor" || role === "admin")) {
      window.location.href = "/login"
      return
    }
    const headers = { Authorization: `Bearer ${token}` }
    const load = async () => {
      try {
        setError(null)
        const res = await fetch(`${API}/submissions/monitor`, { headers })
        const data = await res.json()
        setRows(data)
      } catch {
        setError("Failed to load active submissions")
      }
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [API])

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Monitoring</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Submission</th>
            <th className="text-left p-2 border">Form</th>
            <th className="text-left p-2 border">Student</th>
            <th className="text-left p-2 border">Started</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="p-2 border">{r.id}</td>
              <td className="p-2 border">{r.form_id}</td>
              <td className="p-2 border">{r.user_id}</td>
              <td className="p-2 border">{new Date(r.started_at).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-2 border" colSpan={4}>No active submissions.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}
