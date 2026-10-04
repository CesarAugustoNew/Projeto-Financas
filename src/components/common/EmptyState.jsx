export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="border border-dashed border-line-strong rounded-card py-14 px-6 text-center">
      <p className="font-display text-lg text-ink-900">{title}</p>
      <p className="text-ink-500 text-sm mt-2 max-w-sm mx-auto">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-card transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
