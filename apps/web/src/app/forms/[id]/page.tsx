"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

type Question = {
  id: number
  form_id: number
  type: "mcq" | "short" | "open" | "numeric"
  prompt: string
  metadata_json?: Record<string, unknown>
}

const API = getApiBase()

export default function FormQuestionsPage() {
  const params = useParams<{ id: string }>()
  const formId = useMemo(() => Number(params?.id), [params])

  const [questions, setQuestions] = useState<Question[]>([])
  const [type, setType] = useState<Question["type"]>("mcq")
  const [prompt, setPrompt] = useState("")
  const [choices, setChoices] = useState<string>("A,B,C,D")
  const [answerIdx, setAnswerIdx] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrompt, setEditPrompt] = useState("")

  const getChoices = (meta: Record<string, unknown> | undefined): string[] | null => {
    const raw = (meta as { choices?: unknown } | undefined)?.choices
    return Array.isArray(raw) ? (raw as string[]) : null
  }

  const buildHeaders = (base?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = { ...(base || {}) }
    const t = getToken()
    if (t) headers["Authorization"] = `Bearer ${t}`
    return headers
  }

  const load = async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/questions?form_id=${formId}`, { headers: buildHeaders() })
      const data = await res.json()
      setQuestions(data)
    } catch {
      setError("Failed to load questions")
    }
  }

  useEffect(() => {
    // guard
    const role = getRole()
    const token = getToken()
    if (!token || !(role === "tutor" || role === "admin")) {
      window.location.href = "/login"
      return
    }
    if (!Number.isFinite(formId)) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

  const create = async () => {
    if (!prompt.trim()) return
    try {
      setLoading(true)
      setError(null)
      let metadata: Record<string, unknown> | undefined = undefined
      if (type === "mcq") {
        metadata = {
          choices: choices.split(",").map((s) => s.trim()).filter(Boolean),
          answer: Number(answerIdx) || 0,
        }
      }
      const res = await fetch(`${API}/questions`, {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ form_id: formId, type, prompt, metadata_json: metadata }),
      })
      if (!res.ok) {
        let msg = "Failed to create question"
        try {
          const j = await res.json() as any
          if (typeof j?.detail === "string") msg = j.detail
          else if (Array.isArray(j?.detail)) msg = j.detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; ")
        } catch {}
        throw new Error(msg)
      }
      setPrompt("")
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to create question")
    } finally {
      setLoading(false)
    }
  }

  const beginEdit = (q: Question) => {
    setEditingId(q.id)
    setEditPrompt(q.prompt)
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      setLoading(true)
      const res = await fetch(`${API}/questions/${editingId}`, {
        method: "PATCH",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ prompt: editPrompt }),
      })
      if (!res.ok) throw new Error("update failed")
      setEditingId(null)
      await load()
    } catch {
      setError("Failed to update question")
    } finally {
      setLoading(false)
    }
  }

  const deleteQuestion = async (id: number) => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/questions/${id}`, { method: "DELETE", headers: buildHeaders() })
      if (!res.ok) throw new Error("delete failed")
      await load()
    } catch {
      setError("Failed to delete question")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <a href="/forms" className="text-blue-700 underline">← Back to Forms</a>
      <h1 className="text-2xl font-bold">Questions for form #{formId}</h1>

      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <label className="text-sm">Type</label>
          <select
            className="border rounded px-2 py-1"
            value={type}
            onChange={(e) => setType(e.target.value as Question["type"])}
          >
            <option value="mcq">MCQ</option>
            <option value="short">Short</option>
            <option value="open">Open</option>
            <option value="numeric">Numeric</option>
          </select>
        </div>
        <textarea
          className="border rounded px-2 py-1 w-full min-h-[80px]"
          placeholder="Prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        {type === "mcq" && (
          <div className="flex gap-2 items-center">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Choices comma separated"
              value={choices}
              onChange={(e) => setChoices(e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              placeholder="Answer idx"
              value={answerIdx}
              onChange={(e) => setAnswerIdx(Number(e.target.value))}
            />
          </div>
        )}
        <button
          onClick={create}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Add Question"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <ul className="divide-y border rounded">
        {questions.map((q) => (
          <li key={q.id} className="p-3 space-y-2">
            {editingId === q.id ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">[{q.type}]</div>
                <textarea
                  className="border rounded px-2 py-1 w-full min-h-[80px]"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading} onClick={saveEdit}>Save</button>
                  <button className="px-3 py-1 rounded border" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-sm text-gray-600">[{q.type}]</div>
                <div className="font-medium">{q.prompt}</div>
                {q.type === "mcq" && getChoices(q.metadata_json) && (
                  <div className="text-sm">Choices: {getChoices(q.metadata_json)!.join(", ")}</div>
                )}
                <div className="flex gap-3">
                  <button className="text-sm underline" onClick={() => beginEdit(q)}>Edit</button>
                  <button className="text-sm text-red-700 underline" onClick={() => deleteQuestion(q.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
        {questions.length === 0 && (
          <li className="p-3 text-sm text-gray-600">No questions yet.</li>
        )}
      </ul>
    </main>
  )
}
