"use client"

import { useEffect, useRef, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

export default function StudentExamPage() {
  const API = getApiBase()
  const [formId, setFormId] = useState<string>("")
  const [answer, setAnswer] = useState<string>("")
  const [stream, setStream] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const role = getRole()
    const token = getToken()
    if (!token || !(role === "student" || role === "tutor" || role === "admin")) {
      // Allow tutors/admins to test, but primarily for students
      window.location.href = "/login"
      return
    }
    return () => {
      if (esRef.current) esRef.current.close()
    }
  }, [])

  const startHints = () => {
    try {
      setError(null)
      if (esRef.current) esRef.current.close()
      const qs = new URLSearchParams({ text: answer || "", form_id: formId || "" }).toString()
      const es = new EventSource(`${API}/realtime/hint?${qs}`)
      es.addEventListener("hint", (e) => setStream((prev) => [...prev, (e as MessageEvent).data]))
      es.addEventListener("context", (e) => setStream((prev) => [...prev, (e as MessageEvent).data]))
      es.onerror = () => {
        setError("Stream error")
        es.close()
      }
      esRef.current = es
    } catch {
      setError("Failed to start hints")
    }
  }

  const clearStream = () => setStream([])

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Student Exam</h1>

      <div className="space-y-2">
        <label className="text-sm text-gray-700">Form ID (optional for demo)</label>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="e.g. 1"
          value={formId}
          onChange={(e) => setFormId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-700">Your answer</label>
        <textarea
          className="border rounded px-3 py-2 w-full h-40"
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-black text-white px-3 py-1 rounded" onClick={startHints}>Start Hints</button>
          <button className="px-3 py-1 rounded border" onClick={clearStream}>Clear</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Hints</h2>
        <div className="space-y-2">
          {stream.map((line, i) => (
            <div key={i} className="text-sm bg-gray-100 rounded p-2 whitespace-pre-wrap">
              {line}
            </div>
          ))}
          {stream.length === 0 && <div className="text-sm text-gray-600">No hints yet.</div>}
        </div>
      </div>
    </main>
  )
}
