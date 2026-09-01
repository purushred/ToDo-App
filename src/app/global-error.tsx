'use client'

/**
 * Global Error Boundary
 * Handles catastrophic errors that occur outside the root layout
 * Must include html and body tags as it replaces the entire root layout
 */

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log critical error to console
    console.error('Global error boundary caught:', error)
    
    // In production, send to error tracking service
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <svg
                className="w-20 h-20 mx-auto text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Critical Error
            </h1>
            
            <p className="text-gray-600 mb-6">
              A critical error occurred. Please refresh the page or try again later.
            </p>

            {error.digest && (
              <p className="text-xs text-gray-400 mb-6">
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Try again"
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="block mt-3 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label="Refresh page"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}