"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">edu‑rag</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/forms" className="hover:underline">Forms</Link>
          <Link href="/classrooms" className="hover:underline">Classrooms</Link>
          <Link href="/student" className="hover:underline">Student</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
          <Link href="/login" className="ml-2 rounded-md bg-black px-3 py-1.5 text-white">Login</Link>
          <Link href="/register" className="rounded-md border px-3 py-1.5">Register</Link>
        </nav>
      </div>
    </header>
  )
}
