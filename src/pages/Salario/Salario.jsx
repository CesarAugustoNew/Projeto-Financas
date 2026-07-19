import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatMoney } from '../../utils/format.js'

const tipos = ['Salário fixo', 'Freelance', 'Rendimento', 'Outro']

export default function Salario() {
  const { salarios, addSalario, removeSalario, totals } = useFinance()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', tipo: tipos[0], valor: '' })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.valor) return
    addSalario({ nome: form.nome, tipo: form.tipo, valor: Number(form.valor) })
    setForm({ nome: '', tipo: tipos[0], valor: '' })
    setOpen(false)
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-gold-600 text-xs uppercase tracking-widest mb-1">Renda</p>
          <h1 className="font-display text-3xl text-ink-900">Salário e outras rendas</h1>
          <p className="text-ink-500 text-sm mt-2">Tudo que entra no seu caixa, mês a mês.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-gold-600 hover:bg-gold-500 text-white text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
        >
          + Adicionar renda
        </button>
      </header>

      <Card className="mb-6">
        <p className="text-ink-500 text-xs uppercase tracking-wider">Renda total mensal</p>
        <p className="ledger-number text-3xl text-gold-600 mt-2">{formatMoney(totals.totalRenda)}</p>
      </Card>

      {salarios.length === 0 ? (
        <EmptyState
          title="Nenhuma renda cadastrada"
          description="Adicione seu salário ou outras fontes de renda para começar a montar seu painel."
          actionLabel="Adicionar renda"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {salarios.map((s) => (
            <Card key={s.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-ink-900 text-sm font-medium">{s.nome}</p>
                <p className="text-ink-500 text-xs mt-0.5">{s.tipo}</p>
              </div>
              <div className="flex items-center gap-5">
                <span className="ledger-number text-teal-600 text-lg">{formatMoney(s.valor)}</span>
                <button
                  onClick={() => removeSalario(s.id)}
                  aria-label={`Remover ${s.nome}`}
                  className="text-ink-500 hover:text-clay-600 text-sm"
                >
                  Remover
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Adicionar renda">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Descrição</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Salário CLT"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
              required
            />
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Valor mensal (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="0,00"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gold-600 hover:bg-gold-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Salvar renda
          </button>
        </form>
      </Modal>
    </div>
  )
}
