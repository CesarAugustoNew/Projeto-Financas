const CAT = {
  Alimentação: { bg: '#FFF1E0', fg: '#E07A1F', d: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7 0 1.7 1 3 3 3v8' },
  Transporte: { bg: '#E6F0FF', fg: '#2F6FDB', d: 'M5 16v-4l1.5-4.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12v4M5 16h14M5 16v2.5M19 16v2.5M8 13h.01M16 13h.01' },
  Moradia: { bg: '#EFE9FF', fg: '#7048D9', d: 'M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6' },
  Lazer: { bg: '#FFE8F1', fg: '#D6336C', d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01' },
  Saúde: { bg: '#E6F7FB', fg: '#0C8DB0', d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z' },
  Educação: { bg: '#E8EAFF', fg: '#4C5BD4', d: 'M2 9l10-5 10 5-10 5L2 9ZM6 11.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.5' },
  Compras: { bg: '#FFF6D6', fg: '#B8860B', d: 'M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2' },
  Assinaturas: { bg: '#F3EBE7', fg: '#8D6E63', d: 'M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM3 10.5h18' },
  Outros: { bg: '#EAEFEB', fg: '#66756B', d: 'M6 12h.01M12 12h.01M18 12h.01' }
}

export const CATEGORY_COLORS = Object.fromEntries(Object.entries(CAT).map(([k, v]) => [k, v.fg]))

export default function CategoryIcon({ categoria, size = 40 }) {
  const c = CAT[categoria] || CAT.Outros
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: c.bg, color: c.fg }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={categoria === 'Outros' ? 3 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={c.d} />
      </svg>
    </span>
  )
}
