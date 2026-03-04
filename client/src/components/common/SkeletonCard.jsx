// generic animated skeleton for loading states
const SkeletonCard = ({ lines = 3, className = '' }) => (
  <div className={`card p-5 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-gray-100 dark:bg-gray-700 rounded mb-2"
        style={{ width: `${90 - i * 15}%` }}
      />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-10 bg-gray-50 dark:bg-gray-700 border-b border-surface-border" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-surface-border last:border-b-0">
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-24" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded flex-1" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-16" />
      </div>
    ))}
  </div>
);

export default SkeletonCard;
