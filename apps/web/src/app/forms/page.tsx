"use client"

import { useEffect, useState } from "react"

type FormOut = {
  id: number
  title: string
  description?: string | null
}

const API = "http://localhost:8000"

export default function FormsPage() {
  const [forms, setForms] = useState<FormOut[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/forms`)
      const data = await res.json()
      setForms(data)
    } catch {
      setError("Failed to load forms")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!title.trim()) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || null }),
      })
      if (!res.ok) throw new Error("create failed")
      setTitle("")
      setDescription("")
      await load()
    } catch {
      setError("Failed to create form")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Forms</h1>

      <div className="space-y-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={create}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Form"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <ul className="divide-y border rounded">
        {forms.map((f) => (
          <li key={f.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{f.title}</div>
              {f.description && (
                <div className="text-sm text-gray-600">{f.description}</div>
              )}
            </div>
            <a
              className="text-blue-700 underline"
              href={`/forms/${f.id}`}
            >
              Questions
            </a>
          </li>
        ))}
        {forms.length === 0 && (
          <li className="p-3 text-sm text-gray-600">No forms yet.</li>
        )}
      </ul>
    </main>
  )
}
