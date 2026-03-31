export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          data-testid="skeleton-card"
          className="animate-pulse"
        >
          <div className="bg-[--color-surface] rounded-lg aspect-square mb-3" />
          <div className="bg-[--color-surface] rounded h-4 mb-2 w-3/4" />
          <div className="bg-[--color-surface] rounded h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
