"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getRole, clearToken } from "@/lib/auth"

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(getRole())
  }, [])

  const logout = () => {
    clearToken()
    window.location.href = "/"
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">edu‑rag</Link>
        <nav className="flex items-center gap-3 text-sm">
          {!role && (
            <>
              <Link href="/login" className="ml-2 rounded-md bg-black px-3 py-1.5 text-white">Login</Link>
              <Link href="/register" className="rounded-md border px-3 py-1.5">Register</Link>
            </>
          )}
          {role === "student" && (
            <>
              <Link href="/student/exams" className="hover:underline">My Exams</Link>
              <button onClick={logout} className="rounded-md border px-3 py-1.5">Logout</button>
            </>
          )}
          {(role === "tutor" || role === "admin") && (
            <>
              <Link href="/tutor" className="hover:underline">Dashboard</Link>
              <Link href="/forms" className="hover:underline">Forms</Link>
              <Link href="/classrooms" className="hover:underline">Classrooms</Link>
              <Link href="/videos" className="hover:underline">Videos</Link>
              {role === "admin" && <Link href="/admin" className="hover:underline">Admin</Link>}
              <button onClick={logout} className="rounded-md border px-3 py-1.5">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
