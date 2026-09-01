/**
 * Loading UI for the home page
 * Displayed while the page is being rendered on the server
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header skeleton */}
        <header className="mb-8">
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </header>

        {/* Form skeleton */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* List skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 border-b border-gray-200"
            >
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}