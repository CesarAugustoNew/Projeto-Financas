import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatMoney } from '../../utils/format.js'
import { computeRendaMes, currentMonthRef } from '../../utils/renda.js'

const tipos = ['Salário fixo', 'Freelance', 'Rendimento', 'Outro']

export default function Salario() {
  const { salarios, addSalario, removeSalario, totals } = useFinance()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', tipo: tipos[0], valor: '', diaPagamento: '5' })

  const statusMes = useMemo(
    () => computeRendaMes(salarios, currentMonthRef()),
    [salarios]
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.valor) return
    addSalario({
      nome: form.nome,
      tipo: form.tipo,
      valor: Number(form.valor),
      diaPagamento: Number(form.diaPagamento) || 5
    })
    setForm({ nome: '', tipo: tipos[0], valor: '', diaPagamento: '5' })
    setOpen(false)
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-gold-600 text-xs uppercase tracking-widest mb-1">Renda</p>
          <h1 className="font-display text-3xl text-ink-900">Salário e outras rendas</h1>
          <p className="text-ink-500 text-sm mt-2">
            Cadastre o dia em que cada renda cai. O painel atualiza sozinho, sem precisar editar nada.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-gold-600 hover:bg-gold-500 text-white text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
        >
          + Adicionar renda
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Renda total mensal</p>
          <p className="ledger-number text-2xl text-gold-600 mt-2">{formatMoney(totals.totalRenda)}</p>
        </Card>
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Já caiu este mês</p>
          <p className="ledger-number text-2xl text-teal-600 mt-2">{formatMoney(statusMes.totalRecebido)}</p>
        </Card>
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Ainda vai cair</p>
          <p className="ledger-number text-2xl text-ink-900 mt-2">{formatMoney(statusMes.totalAReceber)}</p>
        </Card>
      </div>

      {salarios.length === 0 ? (
        <EmptyState
          title="Nenhuma renda cadastrada"
          description="Adicione seu salário com o dia em que costuma cair (ex: dia 5 e dia 20) para o painel se atualizar sozinho todo mês."
          actionLabel="Adicionar renda"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {statusMes.itens.map((s) => (
            <Card key={s.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-ink-900 text-sm font-medium">{s.nome}</p>
                <p className="text-ink-500 text-xs mt-0.5">
                  {s.tipo} · cai todo dia {s.diaEfetivo}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    s.recebido
                      ? 'bg-[#EAF5F2] text-teal-600 border border-teal-500/30'
                      : 'bg-paper-200 text-ink-700'
                  }`}
                >
                  {s.recebido ? 'Já caiu' : `Cai dia ${s.diaEfetivo}`}
                </span>
                <span className="ledger-number text-ink-900 text-lg w-28 text-right">
                  {formatMoney(s.valor)}
                </span>
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
              placeholder="Ex: Salário CLT (1ª quinzena)"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">Valor (R$)</label>
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
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">Dia do pagamento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={form.diaPagamento}
                onChange={(e) => setForm({ ...form, diaPagamento: e.target.value })}
                placeholder="5"
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
                required
              />
            </div>
          </div>
          <p className="text-ink-500 text-xs -mt-2">
            Recebe em duas datas? Cadastre duas rendas separadas (ex: dia 5 e dia 20).
          </p>
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
