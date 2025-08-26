"use client"

import { useEffect, useRef, useState } from "react"
import { getApiBase } from "@/lib/api"

type VideoOut = {
  id: number
  storage_key: string
  duration?: number | null
  lang?: string | null
  created_at: string
}

export default function VideosPage() {
  const API = getApiBase()
  const [videos, setVideos] = useState<VideoOut[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const load = async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/videos`)
      const data = await res.json()
      setVideos(data)
    } catch {
      setError("Failed to load videos")
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upload = async () => {
    if (!fileRef.current?.files?.[0]) return
    try {
      setUploading(true)
      setError(null)
      const form = new FormData()
      form.append("file", fileRef.current.files[0])
      const res = await fetch(`${API}/videos`, { method: "POST", body: form })
      if (!res.ok) throw new Error("upload failed")
      await load()
      if (fileRef.current) fileRef.current.value = ""
    } catch {
      setError("Failed to upload video")
    } finally {
      setUploading(false)
    }
  }

  const index = async (id: number) => {
    try {
      setError(null)
      const res = await fetch(`${API}/videos/${id}/index`, { method: "POST" })
      if (!res.ok) throw new Error("index failed")
      await load()
    } catch {
      setError("Failed to index video")
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Videos</h1>

      <div className="flex gap-2 items-center">
        <input type="file" accept="video/*" ref={fileRef} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50" disabled={uploading} onClick={upload}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <ul className="divide-y border rounded">
        {videos.map((v) => (
          <li key={v.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">#{v.id} • {v.storage_key}</div>
              <div className="text-sm text-gray-600">{new Date(v.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-3">
              <button className="text-sm underline" onClick={() => index(v.id)}>Index</button>
            </div>
          </li>
        ))}
        {videos.length === 0 && (
          <li className="p-3 text-sm text-gray-600">No videos uploaded.</li>
        )}
      </ul>
    </main>
  )
}
