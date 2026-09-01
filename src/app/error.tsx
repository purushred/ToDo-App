'use client'

/**
 * Error boundary for the application
 * Catches and displays errors in the UI
 */

import { useEffect } from 'react'
import { ErrorResponse } from '@/types/api-responses'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error)
    }
    
    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error)
  }, [error])

  const errorId = error.digest || `err_${Date.now()}`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
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

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-4">
          An error occurred while loading this page. Please try again.
        </p>

        <p className="text-xs text-gray-400 mb-6">
          Error ID: {errorId}
        </p>

        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Try again"
        >
          Try Again
        </button>

        <button
          onClick={() => window.location.href = '/'}
          className="block mt-3 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Go back home"
        >
          Go back home
        </button>
      </div>
    </div>
  )
}