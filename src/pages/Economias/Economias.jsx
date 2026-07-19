import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatMoney } from '../../utils/format.js'

export default function Economias() {
  const { economias, addEconomia, removeEconomia, aportarEconomia, totals } = useFinance()
  const [open, setOpen] = useState(false)
  const [aporteId, setAporteId] = useState(null)
  const [aporteValor, setAporteValor] = useState('')
  const [form, setForm] = useState({ nome: '', meta: '' })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.meta) return
    addEconomia({ nome: form.nome, meta: Number(form.meta) })
    setForm({ nome: '', meta: '' })
    setOpen(false)
  }

  function handleAporte(e) {
    e.preventDefault()
    if (!aporteId || !aporteValor) return
    aportarEconomia(aporteId, Number(aporteValor))
    setAporteId(null)
    setAporteValor('')
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-teal-600 text-xs uppercase tracking-widest mb-1">Economias</p>
          <h1 className="font-display text-3xl text-ink-900">Metas de economia</h1>
          <p className="text-ink-500 text-sm mt-2">Reserve um propósito para cada real guardado.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
        >
          + Nova meta
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Total guardado</p>
          <p className="ledger-number text-2xl text-teal-600 mt-2">{formatMoney(totals.totalEconomizado)}</p>
        </Card>
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Soma das metas</p>
          <p className="ledger-number text-2xl text-ink-900 mt-2">{formatMoney(totals.totalMetaEconomias)}</p>
        </Card>
      </div>

      {economias.length === 0 ? (
        <EmptyState
          title="Nenhuma meta ainda"
          description="Crie uma meta, como 'reserva de emergência' ou 'viagem', e acompanhe o progresso."
          actionLabel="Criar meta"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {economias.map((e) => {
            const pct = e.meta > 0 ? Math.min(100, ((e.valorAtual || 0) / e.meta) * 100) : 0
            const atingida = pct >= 100
            return (
              <Card key={e.id}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-ink-900 font-medium">{e.nome}</p>
                  <button
                    onClick={() => removeEconomia(e.id)}
                    className="text-ink-500 hover:text-clay-600 text-xs"
                  >
                    Remover
                  </button>
                </div>
                <p className="ledger-number text-xl text-teal-600">
                  {formatMoney(e.valorAtual || 0)}{' '}
                  <span className="text-ink-500 text-sm">/ {formatMoney(e.meta)}</span>
                </p>
                <div className="h-2 bg-paper-200 rounded-full overflow-hidden mt-3 mb-1">
                  <div
                    className={`h-full ${atingida ? 'bg-gold-500' : 'bg-teal-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-ink-500 text-xs">{pct.toFixed(0)}% concluído</span>
                  <button
                    onClick={() => setAporteId(e.id)}
                    className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                  >
                    + Adicionar valor
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova meta de economia">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Nome da meta</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Reserva de emergência"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Valor da meta (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.meta}
              onChange={(e) => setForm({ ...form, meta: e.target.value })}
              placeholder="0,00"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Criar meta
          </button>
        </form>
      </Modal>

      <Modal open={!!aporteId} onClose={() => setAporteId(null)} title="Adicionar valor à meta">
        <form onSubmit={handleAporte} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Valor (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={aporteValor}
              onChange={(e) => setAporteValor(e.target.value)}
              placeholder="0,00"
              autoFocus
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Confirmar aporte
          </button>
        </form>
      </Modal>
    </div>
  )
}
