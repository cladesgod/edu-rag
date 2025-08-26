"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

type Question = {
  id: number
  form_id: number
  type: "mcq" | "short" | "open" | "numeric"
  prompt: string
  metadata_json?: Record<string, unknown>
}

const API = "http://localhost:8000"

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

  const getChoices = (meta: Record<string, unknown> | undefined): string[] | null => {
    const raw = (meta as { choices?: unknown } | undefined)?.choices
    return Array.isArray(raw) ? (raw as string[]) : null
  }

  const load = async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/questions?form_id=${formId}`)
      const data = await res.json()
      setQuestions(data)
    } catch {
      setError("Failed to load questions")
    }
  }

  useEffect(() => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, type, prompt, metadata_json: metadata }),
      })
      if (!res.ok) throw new Error("create failed")
      setPrompt("")
      await load()
    } catch {
      setError("Failed to create question")
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
          <li key={q.id} className="p-3">
            <div className="text-sm text-gray-600">[{q.type}]</div>
            <div className="font-medium">{q.prompt}</div>
            {q.type === "mcq" && getChoices(q.metadata_json) && (
              <div className="text-sm">Choices: {getChoices(q.metadata_json)!.join(", ")}</div>
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
