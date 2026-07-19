import Card from './Card.jsx'

const accentMap = {
  gold: 'text-gold-600',
  teal: 'text-teal-600',
  clay: 'text-clay-600',
  paper: 'text-ink-900'
}

export default function StatCard({ label, value, hint, accent = 'paper' }) {
  return (
    <Card>
      <p className="text-ink-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`ledger-number text-3xl mt-3 ${accentMap[accent]}`}>{value}</p>
      {hint && <p className="text-ink-500 text-xs mt-2">{hint}</p>}
    </Card>
  )
}
