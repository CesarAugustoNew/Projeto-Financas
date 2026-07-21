import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatMoney } from '../../utils/format.js'
import { currentMonthRef } from '../../utils/renda.js'
import { computeDividaMes, monthsBetween } from '../../utils/dividas.js'

function monthRefToInputValue({ year, month }) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function inputValueToMonthRef(value) {
  const [year, month] = value.split('-').map(Number)
  return { year, month: month - 1 }
}

const hoje = currentMonthRef()

export default function Dividas() {
  const { dividas, addDivida, removeDivida } = useFinance()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    valorParcela: '',
    numParcelas: '12',
    diaVencimento: '10',
    inicio: monthRefToInputValue(hoje)
  })

  const statusMes = useMemo(() => computeDividaMes(dividas, hoje), [dividas])
  const statusPorId = useMemo(() => {
    const map = {}
    statusMes.itens.forEach((i) => {
      map[i.id] = i
    })
    return map
  }, [statusMes])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.valorParcela || !form.numParcelas) return
    addDivida({
      nome: form.nome,
      valorParcela: Number(form.valorParcela),
      numParcelas: Number(form.numParcelas),
      diaVencimento: Number(form.diaVencimento) || 10,
      inicio: inputValueToMonthRef(form.inicio)
    })
    setForm({ nome: '', valorParcela: '', numParcelas: '12', diaVencimento: '10', inicio: monthRefToInputValue(hoje) })
    setOpen(false)
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-clay-600 text-xs uppercase tracking-widest mb-1">Dívidas</p>
          <h1 className="font-display text-3xl text-ink-900">Dívidas parceladas</h1>
          <p className="text-ink-500 text-sm mt-2">
            Cadastre o valor e o número de parcelas uma vez. O painel acompanha em qual parcela você está, mês a mês.
          </p>
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
          <p className="text-ink-500 text-xs uppercase tracking-wider">Parcelas deste mês</p>
          <p className="ledger-number text-2xl text-clay-600 mt-2">{formatMoney(statusMes.totalParcelasMes)}</p>
        </Card>
        <Card>
          <p className="text-ink-500 text-xs uppercase tracking-wider">Já pago este mês</p>
          <p className="ledger-number text-2xl text-teal-600 mt-2">{formatMoney(statusMes.totalPagoMes)}</p>
        </Card>
      </div>

      {dividas.length === 0 ? (
        <EmptyState
          title="Nenhuma dívida cadastrada"
          description="Registre financiamentos, cartões ou empréstimos parcelados: valor da parcela, quantas parcelas e o dia de vencimento."
          actionLabel="Cadastrar dívida"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {dividas.map((d) => {
            const idxHoje = monthsBetween(d.inicio, hoje)
            const parcelasDecorridas = Math.min(Math.max(idxHoje, 0), d.numParcelas)
            const statusHoje = statusPorId[d.id]
            const quitada = idxHoje >= d.numParcelas
            const aindaNaoComecou = idxHoje < 0
            const pct = d.numParcelas > 0 ? Math.min(100, (parcelasDecorridas / d.numParcelas) * 100) : 0
            const valorTotal = d.numParcelas * d.valorParcela

            return (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-ink-900 font-medium">{d.nome}</p>
                    <p className="text-ink-500 text-xs mt-0.5">
                      {formatMoney(d.valorParcela)} · {d.numParcelas}x · vence dia {d.diaVencimento}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {quitada ? (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#EAF5F2] text-teal-600">
                        Quitada
                      </span>
                    ) : aindaNaoComecou ? (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-paper-200 text-ink-700">
                        Começa {monthRefToInputValue(d.inicio)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-paper-200 text-ink-700">
                        Parcela {statusHoje ? statusHoje.parcelaAtual : parcelasDecorridas}/{d.numParcelas}
                        {statusHoje?.paga ? ' · paga' : ' · pendente'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-paper-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${quitada ? 'bg-teal-500' : 'bg-clay-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-ink-500 text-xs">
                    Total: {formatMoney(valorTotal)} · restam{' '}
                    {formatMoney(Math.max(0, (d.numParcelas - parcelasDecorridas) * d.valorParcela))}
                  </p>
                  <button
                    onClick={() => removeDivida(d.id)}
                    className="text-ink-500 hover:text-clay-600 text-xs"
                  >
                    Remover
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova dívida parcelada">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">Valor da parcela (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valorParcela}
                onChange={(e) => setForm({ ...form, valorParcela: e.target.value })}
                placeholder="0,00"
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
                required
              />
            </div>
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">Quantidade de parcelas</label>
              <input
                type="number"
                min="1"
                value={form.numParcelas}
                onChange={(e) => setForm({ ...form, numParcelas: e.target.value })}
                placeholder="12"
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">Dia do vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={form.diaVencimento}
                onChange={(e) => setForm({ ...form, diaVencimento: e.target.value })}
                placeholder="10"
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
                required
              />
            </div>
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">1ª parcela em</label>
              <input
                type="month"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-clay-500"
                required
              />
            </div>
          </div>
          {form.valorParcela && form.numParcelas && (
            <p className="text-ink-500 text-xs -mt-2">
              Total da dívida: {formatMoney(Number(form.valorParcela) * Number(form.numParcelas))}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-clay-600 hover:bg-clay-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Cadastrar dívida
          </button>
        </form>
      </Modal>
    </div>
  )
}
