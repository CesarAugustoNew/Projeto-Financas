import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ExpensesDonut from '../../components/charts/ExpensesDonut.jsx'
import { formatMoney, formatDate } from '../../utils/format.js'
import { CATEGORIAS_GASTO, todayISO, computeGastosMes } from '../../utils/gastos.js'
import { currentMonthRef, monthLabel, addMonths } from '../../utils/renda.js'

export default function Gastos() {
  const { gastos, addGasto, removeGasto, saldoConta, updateSaldoConta, totals } = useFinance()
  const [open, setOpen] = useState(false)
  const [mesRef, setMesRef] = useState(() => currentMonthRef())
  const [form, setForm] = useState({
    nome: '',
    categoria: CATEGORIAS_GASTO[0],
    valor: '',
    data: todayISO()
  })
  const [saldoInput, setSaldoInput] = useState(String(saldoConta || 0))
  const [editandoSaldo, setEditandoSaldo] = useState(false)

  const gastosMes = useMemo(() => computeGastosMes(gastos, mesRef), [gastos, mesRef])
  const isMesAtual = mesRef.year === currentMonthRef().year && mesRef.month === currentMonthRef().month

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.valor) return
    addGasto({
      nome: form.nome,
      categoria: form.categoria,
      valor: Number(form.valor),
      data: form.data || todayISO()
    })
    setForm({ nome: '', categoria: CATEGORIAS_GASTO[0], valor: '', data: todayISO() })
    setOpen(false)
  }

  function handleSalvarSaldo(e) {
    e.preventDefault()
    updateSaldoConta(saldoInput)
    setEditandoSaldo(false)
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold-600 text-xs uppercase tracking-widest mb-1">Gastos</p>
          <h1 className="font-display text-3xl text-ink-900">Saldo e gastos do mês</h1>
          <p className="text-ink-500 text-sm mt-2">
            Informe o que você tem em conta hoje e registre cada gasto com uma categoria, para ver
            para onde o dinheiro está indo.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSaldoInput(String(saldoConta || 0))
              setEditandoSaldo(true)
            }}
            className="bg-paper-100 border border-line hover:bg-paper-200 text-ink-900 text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
          >
            Atualizar saldo em conta
          </button>
          <button
            onClick={() => setOpen(true)}
            className="bg-gold-600 hover:bg-gold-500 text-white text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
          >
            + Adicionar gasto
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Saldo em conta (informado)" value={formatMoney(saldoConta)} accent="gold" />
        <StatCard
          label="Gastos deste mês"
          value={formatMoney(totals.totalGastosMes)}
          hint="já descontados do saldo abaixo"
          accent="clay"
        />
        <StatCard
          label="Saldo disponível"
          value={formatMoney(totals.saldoDisponivel)}
          hint="saldo em conta − gastos do mês"
          accent={totals.saldoDisponivel < 0 ? 'clay' : 'teal'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg text-ink-900">Gastos do mês</h2>
            <div className="flex items-center gap-2 bg-paper-100 border border-line rounded-card px-2 py-1.5">
              <button
                onClick={() => setMesRef((m) => addMonths(m, -1))}
                aria-label="Mês anterior"
                className="w-7 h-7 flex items-center justify-center rounded-md text-ink-700 hover:bg-paper-200 hover:text-ink-900"
              >
                ‹
              </button>
              <span className="ledger-number text-sm text-ink-900 min-w-[120px] text-center capitalize">
                {monthLabel(mesRef.year, mesRef.month)}
              </span>
              <button
                onClick={() => setMesRef((m) => addMonths(m, 1))}
                aria-label="Próximo mês"
                className="w-7 h-7 flex items-center justify-center rounded-md text-ink-700 hover:bg-paper-200 hover:text-ink-900"
              >
                ›
              </button>
            </div>
          </div>
          <p className="text-ink-500 text-xs mb-4">
            Total do mês: <span className="ledger-number">{formatMoney(gastosMes.total)}</span>
          </p>

          {gastosMes.itens.length === 0 ? (
            <EmptyState
              title="Nenhum gasto neste mês"
              description="Registre seus gastos com uma categoria para acompanhar para onde o dinheiro está indo."
              actionLabel={isMesAtual ? 'Adicionar gasto' : undefined}
              onAction={() => setOpen(true)}
            />
          ) : (
            <ul className="divide-y divide-line">
              {gastosMes.itens.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-ink-900 text-sm">{g.nome}</p>
                    <p className="text-ink-500 text-xs mt-0.5">
                      {g.categoria} · {formatDate(g.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="ledger-number text-clay-600 text-sm w-24 text-right">
                      {formatMoney(g.valor)}
                    </span>
                    <button
                      onClick={() => removeGasto(g.id)}
                      aria-label={`Remover ${g.nome}`}
                      className="text-ink-500 hover:text-clay-600 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg text-ink-900 mb-1">Por categoria</h2>
          <p className="text-ink-500 text-xs mb-2">Estatística do mês selecionado</p>
          <ExpensesDonut data={gastosMes.porCategoria} />
          {gastosMes.porCategoria.length > 0 && (
            <ul className="mt-4 space-y-2">
              {gastosMes.porCategoria.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">{c.name}</span>
                  <span className="ledger-number text-ink-900">{formatMoney(c.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal open={editandoSaldo} onClose={() => setEditandoSaldo(false)} title="Atualizar saldo em conta">
        <form onSubmit={handleSalvarSaldo} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Quanto você tem em conta hoje (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={saldoInput}
              onChange={(e) => setSaldoInput(e.target.value)}
              placeholder="0,00"
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
              autoFocus
              required
            />
          </div>
          <p className="text-ink-500 text-xs -mt-2">
            Esse valor é o ponto de partida. Cada gasto que você cadastrar será descontado dele.
          </p>
          <button
            type="submit"
            className="w-full bg-gold-600 hover:bg-gold-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Salvar saldo
          </button>
        </form>
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="Adicionar gasto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Descrição</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Supermercado, Uber, Netflix..."
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
              required
            />
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              <label className="text-ink-700 text-xs block mb-1.5">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-gold-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gold-600 hover:bg-gold-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Salvar gasto
          </button>
        </form>
      </Modal>
    </div>
  )
}
