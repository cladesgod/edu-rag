"use client"

import { useEffect, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

type Sub = { id: number; form_id: number; user_id: number }

export default function StudentExams() {
  const API = getApiBase()
  const [subs, setSubs] = useState<Sub[]>([])
  const [formId, setFormId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const token = getToken()
      const res = await fetch(`${API}/submissions/mine`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setSubs(data)
    } catch {
      setError("Failed to load submissions")
    }
  }

  useEffect(() => {
    const role = getRole()
    const token = getToken()
    if (!token || !(role === "student" || role === "tutor" || role === "admin")) {
      window.location.href = "/login"
      return
    }
    load()
  }, [])

  const start = async () => {
    if (!formId.trim()) return
    try {
      const token = getToken()
      const res = await fetch(`${API}/submissions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ form_id: Number(formId) })
      })
      if (!res.ok) throw new Error("start failed")
      const sub = await res.json()
      window.location.href = `/student/exams/${sub.id}`
    } catch {
      setError("Failed to start exam")
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">My Exams</h1>
      <div className="border rounded p-3 space-y-2">
        <div className="text-sm text-gray-700">Start a new exam (enter Form ID)</div>
        <div className="flex gap-2">
          <input className="border rounded px-2 py-1" placeholder="Form ID" value={formId} onChange={(e) => setFormId(e.target.value)} />
          <button className="bg-black text-white px-3 py-1 rounded" onClick={start}>Start</button>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <ul className="divide-y border rounded">
        {subs.map(s => (
          <li key={s.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">Submission #{s.id}</div>
              <div className="text-sm text-gray-600">Form: {s.form_id}</div>
            </div>
            <a className="text-blue-700 underline" href={`/student/exams/${s.id}`}>Open</a>
          </li>
        ))}
        {subs.length === 0 && <li className="p-3 text-sm text-gray-600">No exams yet.</li>}
      </ul>
    </main>
  )
}
