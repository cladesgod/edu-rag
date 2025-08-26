'use client'

import { useEffect, useRef, useState } from 'react'
import { getApiBase } from '@/lib/api'

export default function Home() {
  const [health, setHealth] = useState<string>('checking...')
  const [input, setInput] = useState<string>('')
  const [sse, setSse] = useState<string[]>([])
  const evtSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetch(`${getApiBase()}/health`)
      .then((r) => r.json())
      .then((j) => setHealth(JSON.stringify(j)))
      .catch(() => setHealth('error'))

    return () => {
      if (evtSourceRef.current) {
        evtSourceRef.current.close()
      }
    }
  }, [])

  const startStream = () => {
    if (evtSourceRef.current) evtSourceRef.current.close()
    const qs = new URLSearchParams({ text: input }).toString()
    const es = new EventSource(`${getApiBase()}/realtime/hint?${qs}`)
    es.addEventListener('hint', (e) => setSse((prev) => [...prev, (e as MessageEvent).data]))
    es.addEventListener('context', (e) => setSse((prev) => [...prev, (e as MessageEvent).data]))
    es.onerror = () => es.close()
    evtSourceRef.current = es
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">edu-rag web</h1>
      <div className="text-sm">API health: {health}</div>
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="Type text to get hints"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-black text-white px-3 py-1 rounded" onClick={startStream}>
          Start SSE
        </button>
      </div>
      <div className="space-y-2">
        {sse.map((line, i) => (
          <div key={i} className="text-sm bg-gray-100 rounded p-2">
            {line}
          </div>
        ))}
      </div>
    </main>
  )
}
