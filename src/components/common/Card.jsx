export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-paper-50 border border-line rounded-card shadow-card p-6 ${className}`}>
      {children}
    </div>
  )
}
