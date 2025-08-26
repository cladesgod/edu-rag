"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { getApiBase } from "@/lib/api"

function toWsUrl(httpUrl: string): string {
  try {
    const u = new URL(httpUrl)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    return u.toString().replace(/\/$/, "")
  } catch {
    return httpUrl.replace(/^http/, "ws")
  }
}

export default function WebSocketDemo() {
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const [lines, setLines] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const wsEndpoint = useMemo(() => {
    const base = getApiBase()
    return toWsUrl(`${base}/realtime/ws/hint`)
  }, [])

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const connect = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }
    const ws = new WebSocket(wsEndpoint)
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    ws.onmessage = (ev) => setLines((prev) => [...prev, ev.data])
    wsRef.current = ws
  }

  const send = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ text: input }))
    setInput("")
  }

  const disconnect = () => {
    if (wsRef.current) wsRef.current.close()
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">WebSocket Hint Demo</h1>
      <div className="text-sm">Endpoint: {wsEndpoint}</div>
      <div className="flex gap-2 items-center">
        <button className="px-3 py-1 rounded bg-black text-white" onClick={connect} disabled={connected}>Connect</button>
        <button className="px-3 py-1 rounded border" onClick={disconnect} disabled={!connected}>Disconnect</button>
        <span className={`text-sm ${connected ? "text-green-700" : "text-gray-600"}`}>{connected ? "Connected" : "Disconnected"}</span>
      </div>
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 flex-1" placeholder="Type to get hints" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={send} disabled={!connected || !input.trim()}>Send</button>
      </div>
      <div className="space-y-2 max-h-80 overflow-auto border rounded p-2 bg-gray-50">
        {lines.map((l, i) => (
          <div key={i} className="text-sm whitespace-pre-wrap">{l}</div>
        ))}
        {lines.length === 0 && <div className="text-sm text-gray-500">No messages yet.</div>}
      </div>
    </main>
  )
}
