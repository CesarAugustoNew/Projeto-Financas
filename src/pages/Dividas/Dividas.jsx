import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatMoney, formatDate } from '../../utils/format.js'

export default function Dividas() {
  const { dividas, addDivida, removeDivida, pagarParcela, totals } = useFinance()
  const [open, setOpen] = useState(false)
  const [pagamentoId, setPagamentoId] = useState(null)
  const [pagamentoValor, setPagamentoValor] = useState('')
  const [form, setForm] = useState({ nome: '', valorTotal: '', vencimento: '' })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.valorTotal) return
    addDivida({ nome: form.nome, valorTotal: Number(form.valorTotal), vencimento: form.vencimento })
    setForm({ nome: '', valorTotal: '', vencimento: '' })
    setOpen(false)
  }

  function handlePagamento(e) {
    e.preventDefault()
    if (!pagamentoId || !pagamentoValor) return
    pagarParcela(pagamentoId, Number(pagamentoValor))
    setPagamentoId(null)
    setPagamentoValor('')
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-clay-600 text-xs uppercase tracking-widest mb-1">Dívidas</p>
          <h1 className="font-display text-3xl text-ink-900">Dívidas e parcelamentos</h1>
          <p className="text-ink-500 text-sm mt-2">Saiba exatamente o quanto falta pagar de cada uma.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-clay-600 hover:bg-clay-500 text-white text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
        >
          + Nova dívida
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Total restante</p>
          <p className="ledger-number text-2xl text-clay-600 mt-2">{formatMoney(totals.totalDividasRestante)}</p>
        </Card>
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Já pago</p>
          <p className="ledger-number text-2xl text-teal-600 mt-2">{formatMoney(totals.totalPagoDividas)}</p>
        </Card>
      </div>

      {dividas.length === 0 ? (
        <EmptyState
          title="Nenhuma dívida cadastrada"
          description="Registre financiamentos, cartões ou empréstimos para acompanhar o quanto falta quitar."
          actionLabel="Cadastrar dívida"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {dividas.map((d) => {
            const restante = Math.max(0, d.valorTotal - (d.pago || 0))
            const pct = d.valorTotal > 0 ? Math.min(100, ((d.pago || 0) / d.valorTotal) * 100) : 0
            const quitada = restante <= 0
            return (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-ink-900 font-medium">{d.nome}</p>
                    <p className="text-ink-500 text-xs mt-0.5">
                      Vencimento: {formatDate(d.vencimento)} {quitada && '· quitada'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="ledger-number text-clay-600">{formatMoney(restante)}</p>
                    <p className="text-ink-500 text-xs">de {formatMoney(d.valorTotal)}</p>
                  </div>
                </div>
                <div className="h-2 bg-paper-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${quitada ? 'bg-teal-500' : 'bg-clay-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => removeDivida(d.id)}
                    className="text-ink-500 hover:text-clay-600 text-xs"
                  >
                    Remover
                  </button>
                  {!quitada && (
                    <button
                      onClick={() => setPagamentoId(d.id)}
                      className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                    >
                      Registrar pagamento
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova dívida">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Descrição</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Financiamento do carro"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
              required
            />
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Valor total (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.valorTotal}
              onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
              placeholder="0,00"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
              required
            />
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Vencimento</label>
            <input
              type="date"
              value={form.vencimento}
              onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-clay-600 hover:bg-clay-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Cadastrar dívida
          </button>
        </form>
      </Modal>

      <Modal open={!!pagamentoId} onClose={() => setPagamentoId(null)} title="Registrar pagamento">
        <form onSubmit={handlePagamento} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Valor pago (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pagamentoValor}
              onChange={(e) => setPagamentoValor(e.target.value)}
              placeholder="0,00"
              autoFocus
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-clay-600 hover:bg-clay-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Confirmar pagamento
          </button>
        </form>
      </Modal>
    </div>
  )
}
