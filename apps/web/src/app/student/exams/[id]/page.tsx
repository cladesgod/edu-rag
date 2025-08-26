"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>()
  const API = getApiBase()
  const [submission, setSubmission] = useState<{ id: number; form_id: number; user_id: number; answers: { question_id: number; content: string | null }[] } | null>(null)
  const [questionId, setQuestionId] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [stream, setStream] = useState<string[]>([])
  const esRef = useRef<EventSource | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const token = getToken()
      const res = await fetch(`${API}/submissions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setSubmission(data)
    } catch {
      setError("Failed to load submission")
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
    return () => { if (esRef.current) esRef.current.close() }
  }, [id])

  const save = async () => {
    if (!questionId.trim()) return
    try {
      const token = getToken()
      const res = await fetch(`${API}/submissions/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ submission_id: Number(id), question_id: Number(questionId), content })
      })
      if (!res.ok) throw new Error("save failed")
      await load()
    } catch {
      setError("Failed to save answer")
    }
  }

  const submit = async () => {
    try {
      const token = getToken()
      const res = await fetch(`${API}/submissions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ submission_id: Number(id) })
      })
      if (!res.ok) throw new Error("submit failed")
      window.location.href = "/student/exams"
    } catch {
      setError("Failed to submit exam")
    }
  }

  const startHints = () => {
    if (!content) return
    if (esRef.current) esRef.current.close()
    const qs = new URLSearchParams({ text: content }).toString()
    const es = new EventSource(`${API}/realtime/hint?${qs}`)
    es.addEventListener("hint", (e) => setStream((prev) => [...prev, (e as MessageEvent).data]))
    es.addEventListener("context", (e) => setStream((prev) => [...prev, (e as MessageEvent).data]))
    es.onerror = () => es.close()
    esRef.current = es
  }

  if (!submission) return <main className="p-6 max-w-3xl mx-auto">Loading...</main>

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exam #{submission.id}</h1>
        <div className="flex gap-2">
          <button className="rounded-md border px-3 py-1.5" onClick={save}>Save Answer</button>
          <button className="rounded-md bg-black text-white px-3 py-1.5" onClick={submit}>Submit</button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Question ID</label>
          <input className="border rounded px-3 py-2 w-full" value={questionId} onChange={(e) => setQuestionId(e.target.value)} placeholder="e.g. 1" />
          <label className="text-sm text-gray-700">Your answer</label>
          <textarea className="border rounded px-3 py-2 w-full h-48" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your answer..." />
          <div className="flex gap-2">
            <button className="rounded-md border px-3 py-1.5" onClick={startHints}>Start Hints</button>
          </div>
          <div className="text-xs text-gray-600">Saved answers: {submission.answers.length}</div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Hints</h2>
          <div className="mt-2 space-y-2">
            {stream.map((s, i) => (
              <div key={i} className="text-sm bg-gray-100 rounded p-2 whitespace-pre-wrap">{s}</div>
            ))}
            {stream.length === 0 && <div className="text-sm text-gray-600">No hints yet.</div>}
          </div>
        </div>
      </div>
    </main>
  )
}
