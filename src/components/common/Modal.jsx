export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-paper-50 border border-line rounded-card shadow-card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-ink-500 hover:text-ink-900 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
