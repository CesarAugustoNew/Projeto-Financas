export function formatMoney(value) {
  const num = Number(value) || 0
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

export function monthLabel(date = new Date()) {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
}

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
