import Card from './Card.jsx'

const accentMap = {
  gold: 'text-brand-600',
  teal: 'text-teal-600',
  clay: 'text-clay-600',
  paper: 'text-ink-900'
}

export default function StatCard({ label, value, hint, accent = 'paper' }) {
  return (
    <Card>
      <p className="text-ink-500 text-xs uppercase tracking-wider">{label}</p>
      <div className="mt-3 min-w-0" style={{ containerType: 'inline-size' }}>
        <p
          className={`ledger-number whitespace-nowrap leading-tight ${accentMap[accent]}`}
          style={{ fontSize: 'min(1.875rem, 12cqw)' }}
        >
          {value}
        </p>
      </div>
      {hint && <p className="text-ink-500 text-xs mt-2">{hint}</p>}
    </Card>
  )
}
