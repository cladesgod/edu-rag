'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getApiBase } from '@/lib/api'

export default function Home() {
  const [health, setHealth] = useState<string>('checking...')

  useEffect(() => {
    fetch(`${getApiBase()}/health`)
      .then((r) => r.json())
      .then((j) => setHealth(j.status ?? 'ok'))
      .catch(() => setHealth('error'))
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">API health: {health}</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Real‑time, LLM‑assisted assessments for modern classrooms
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Create forms and exams, stream hints as students write, and deliver instant, personalized feedback.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
              Login
            </Link>
            <Link href="/register" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Register
            </Link>
            <Link href="/forms" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Forms
            </Link>
            <Link href="/classrooms" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Classrooms
            </Link>
            <Link href="/admin" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Admin Panel
            </Link>
            <Link href="/ws" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Student Demo
            </Link>
            <Link href="/student" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Student Exam
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900">Form & Question Builder</h3>
            <p className="mt-2 text-sm text-gray-600">Create multiple question types and attach rubrics.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900">Realtime Hints</h3>
            <p className="mt-2 text-sm text-gray-600">Stream guidance as students write; never reveal answers.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900">Video‑RAG</h3>
            <p className="mt-2 text-sm text-gray-600">Point to the exact timestamp in your course videos.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
