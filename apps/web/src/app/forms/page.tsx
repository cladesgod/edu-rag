"use client"

import { useEffect, useState } from "react"

type FormOut = {
  id: number
  title: string
  description?: string | null
}

import { getApiBase } from "@/lib/api"
const API = getApiBase()

export default function FormsPage() {
  const [forms, setForms] = useState<FormOut[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

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

  const beginEdit = (f: FormOut) => {
    setEditingId(f.id)
    setEditTitle(f.title)
    setEditDescription(f.description || "")
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      setLoading(true)
      const res = await fetch(`${API}/forms/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription || null }),
      })
      if (!res.ok) throw new Error("update failed")
      setEditingId(null)
      await load()
    } catch {
      setError("Failed to update form")
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (id: number) => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/forms/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
      await load()
    } catch {
      setError("Failed to delete form")
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
          <li key={f.id} className="p-3 space-y-2">
            {editingId === f.id ? (
              <div className="space-y-2">
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading} onClick={saveEdit}>Save</button>
                  <button className="px-3 py-1 rounded border" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.title}</div>
                  {f.description && (
                    <div className="text-sm text-gray-600">{f.description}</div>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <a className="text-blue-700 underline" href={`/forms/${f.id}`}>Questions</a>
                  <button className="text-sm underline" onClick={() => beginEdit(f)}>Edit</button>
                  <button className="text-sm text-red-700 underline" onClick={() => deleteForm(f.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
        {forms.length === 0 && (
          <li className="p-3 text-sm text-gray-600">No forms yet.</li>
        )}
      </ul>
    </main>
  )
}
