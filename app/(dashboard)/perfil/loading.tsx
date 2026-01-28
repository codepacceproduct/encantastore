export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-32 bg-neutral-200 rounded mb-2"></div>
        <div className="h-4 w-64 bg-neutral-200 rounded"></div>
      </div>
      <div className="space-y-6">
        <div className="h-64 bg-neutral-200 rounded animate-pulse"></div>
        <div className="h-96 bg-neutral-200 rounded animate-pulse"></div>
        <div className="h-48 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
