import { formatMoney } from '../../utils/format.js'

export default function AvisoDuplicadas({ duplicadas, onMarcar }) {
  if (!duplicadas.length) return null
  return (
    <div className="mb-6 rounded-card border border-[#E8C46B] bg-[#FFF8E6] p-4">
      <p className="text-sm font-medium text-ink-900">Possível gasto contado duas vezes</p>
      <p className="text-xs text-ink-700 mt-1">
        Estes gastos têm o mesmo valor de uma parcela de dívida deste mês. Se for a mesma coisa, marque como
        "já está em Dívidas" para ela contar uma vez só.
      </p>
      <ul className="mt-3 space-y-2">
        {duplicadas.map(({ gasto, divida }) => (
          <li key={gasto.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-700">
            <span>
              <span className="text-ink-900">{gasto.nome}</span> ({formatMoney(gasto.valor)}) = parcela de{' '}
              <span className="text-ink-900">{divida.nome}</span>
            </span>
            <button
              onClick={() => onMarcar(gasto.id)}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              Contar só em Dívidas
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
