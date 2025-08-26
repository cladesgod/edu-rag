export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-gray-600 flex items-center justify-between">
        <div>© {new Date().getFullYear()} edu‑rag</div>
        <div className="flex gap-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/videos" className="hover:underline">Videos</a>
          <a href="/ws" className="hover:underline">Realtime Demo</a>
        </div>
      </div>
    </footer>
  )
}
