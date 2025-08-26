/**
 * Standardized error display component
 * Reduces duplication across the application
 */
interface ErrorDisplayProps {
  error: string | null
  className?: string
}

export function ErrorDisplay({ error, className = "" }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className={`text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded ${className}`}>
      {error}
    </div>
  )
}

export default ErrorDisplay