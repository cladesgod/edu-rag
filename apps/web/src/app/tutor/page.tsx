"use client"

import Link from "next/link"
import { useEffect } from "react"
import { getRole, getToken } from "@/lib/auth"

export default function TutorDashboard() {
  useEffect(() => {
    const role = getRole()
    const token = getToken()
    if (!token || !(role === "tutor" || role === "admin")) {
      window.location.href = "/login"
      return
    }
  }, [])

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/forms" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-semibold">Forms</div>
          <div className="text-sm text-gray-600">Create and manage exams</div>
        </Link>
        <Link href="/classrooms" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-semibold">Classrooms</div>
          <div className="text-sm text-gray-600">Manage rosters and assignments</div>
        </Link>
        <Link href="/tutor/monitor" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-semibold">Monitoring</div>
          <div className="text-sm text-gray-600">Track active exams</div>
        </Link>
        <Link href="/videos" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-semibold">Videos</div>
          <div className="text-sm text-gray-600">Upload and index videos</div>
        </Link>
      </div>
    </main>
  )
}
