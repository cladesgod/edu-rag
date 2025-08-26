"use client"

import { useEffect, useState } from "react"
import { getApiBase } from "@/lib/api"
import { getRole, getToken } from "@/lib/auth"

type Classroom = { id: number; name: string }
type User = { id: number; email: string; role: string }
type Form = { id: number; title: string }

export default function ClassroomsPage() {
  const API = getApiBase()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [newClassroomName, setNewClassroomName] = useState("")
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [selectedForm, setSelectedForm] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const role = getRole()
    const token = getToken()
    if (!token || !(role === "tutor" || role === "admin")) {
      window.location.href = "/login"
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const token = getToken()
      const headers = { Authorization: `Bearer ${token}` }
      
      const [classroomsRes, usersRes, formsRes] = await Promise.all([
        fetch(`${API}/classrooms`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
        fetch(`${API}/forms`, { headers })
      ])
      
      const [classroomsData, usersData, formsData] = await Promise.all([
        classroomsRes.json(),
        usersRes.json(),
        formsRes.json()
      ])
      
      setClassrooms(classroomsData)
      setUsers(usersData.filter((u: User) => u.role === "student"))
      setForms(formsData)
    } catch {
      setError("Failed to load data")
    }
  }

  const createClassroom = async () => {
    if (!newClassroomName.trim()) return
    try {
      setLoading(true)
      setError(null)
      const token = getToken()
      const res = await fetch(`${API}/classrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newClassroomName }),
      })
      if (!res.ok) throw new Error("create failed")
      setNewClassroomName("")
      await loadData()
    } catch {
      setError("Failed to create classroom")
    } finally {
      setLoading(false)
    }
  }

  const enrollStudent = async () => {
    if (!selectedClassroom || !selectedUser) return
    try {
      setLoading(true)
      setError(null)
      const token = getToken()
      const res = await fetch(`${API}/classrooms/${selectedClassroom.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: selectedUser }),
      })
      if (!res.ok) throw new Error("enroll failed")
      setSelectedUser(null)
      await loadData()
    } catch {
      setError("Failed to enroll student")
    } finally {
      setLoading(false)
    }
  }

  const assignForm = async () => {
    if (!selectedClassroom || !selectedForm) return
    try {
      setLoading(true)
      setError(null)
      const token = getToken()
      const res = await fetch(`${API}/classrooms/${selectedClassroom.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ form_id: selectedForm }),
      })
      if (!res.ok) throw new Error("assign failed")
      setSelectedForm(null)
      await loadData()
    } catch {
      setError("Failed to assign form")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Classroom Management</h1>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Create Classroom */}
      <div className="border rounded p-4 space-y-2">
        <h2 className="text-lg font-semibold">Create Classroom</h2>
        <div className="flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            placeholder="Classroom name"
            value={newClassroomName}
            onChange={(e) => setNewClassroomName(e.target.value)}
          />
          <button
            onClick={createClassroom}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Classrooms List */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-4">Classrooms</h2>
        <div className="grid gap-4">
          {classrooms.map((c) => (
            <div key={c.id} className="border rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{c.name}</h3>
                <button
                  onClick={() => setSelectedClassroom(selectedClassroom?.id === c.id ? null : c)}
                  className="text-sm text-blue-600 underline"
                >
                  {selectedClassroom?.id === c.id ? "Hide" : "Manage"}
                </button>
              </div>
              
              {selectedClassroom?.id === c.id && (
                <div className="space-y-4">
                  {/* Enroll Student */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Enroll Student</h4>
                    <div className="flex gap-2">
                      <select
                        className="border rounded px-2 py-1 flex-1"
                        value={selectedUser || ""}
                        onChange={(e) => setSelectedUser(Number(e.target.value) || null)}
                      >
                        <option value="">Select student...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.email}</option>
                        ))}
                      </select>
                      <button
                        onClick={enrollStudent}
                        disabled={!selectedUser || loading}
                        className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        Enroll
                      </button>
                    </div>
                  </div>

                  {/* Assign Form */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Assign Form</h4>
                    <div className="flex gap-2">
                      <select
                        className="border rounded px-2 py-1 flex-1"
                        value={selectedForm || ""}
                        onChange={(e) => setSelectedForm(Number(e.target.value) || null)}
                      >
                        <option value="">Select form...</option>
                        {forms.map((f) => (
                          <option key={f.id} value={f.id}>{f.title}</option>
                        ))}
                      </select>
                      <button
                        onClick={assignForm}
                        disabled={!selectedForm || loading}
                        className="bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {classrooms.length === 0 && (
            <div className="text-sm text-gray-600">No classrooms yet.</div>
          )}
        </div>
      </div>
    </main>
  )
}
