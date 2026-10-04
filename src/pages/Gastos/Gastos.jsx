import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Modal from '../../components/common/Modal.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ExpensesDonut from '../../components/charts/ExpensesDonut.jsx'
import CategoryIcon from '../../components/common/CategoryIcon.jsx'
import AvisoDuplicadas from '../../components/common/AvisoDuplicadas.jsx'
import { computeDividaMes } from '../../utils/dividas.js'
import { formatMoney, formatDate } from '../../utils/format.js'
import { CATEGORIAS_GASTO, todayISO, computeGastosMes, acharParcelasDuplicadas, monthKey } from '../../utils/gastos.js'
import { currentMonthRef, monthLabel, addMonths } from '../../utils/renda.js'

export default function Gastos() {
  const { gastos, dividas, addGasto, updateGasto, removeGasto, saldoConta, updateSaldoConta, totals } = useFinance()
  const [open, setOpen] = useState(false)
  const [mesRef, setMesRef] = useState(() => currentMonthRef())
  const [form, setForm] = useState({
    nome: '',
    categoria: CATEGORIAS_GASTO[0],
    valor: '',
    data: todayISO(),
    ehParcela: false,
    recorrencia: 'unico',
    numParcelas: '2'
  })
  const [saldoInput, setSaldoInput] = useState(String(saldoConta || 0))
  const [editandoSaldo, setEditandoSaldo] = useState(false)

  const gastosMes = useMemo(() => computeGastosMes(gastos, mesRef), [gastos, mesRef])
  const duplicadas = useMemo(
    () => acharParcelasDuplicadas(gastosMes.itens, computeDividaMes(dividas, mesRef).itens),
    [gastosMes, dividas, mesRef]
  )
  const hojeISO = todayISO()
  const isMesAtual = mesRef.year === currentMonthRef().year && mesRef.month === currentMonthRef().month

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.valor) return
    addGasto({
      nome: form.nome,
      categoria: form.categoria,
      valor: Number(form.valor),
      data: form.data || todayISO(),
      recorrencia: form.recorrencia,
      ...(form.recorrencia === 'parcelado' ? { numParcelas: Math.max(2, Number(form.numParcelas) || 2) } : {}),
      ehParcela: form.recorrencia === 'unico' ? form.ehParcela : false
    })
    setForm({ nome: '', categoria: CATEGORIAS_GASTO[0], valor: '', data: todayISO(), ehParcela: false, recorrencia: 'unico', numParcelas: '2' })
    setOpen(false)
  }

  function toggleNaoSaiu(g) {
    const k = monthKey(mesRef)
    const lista = g.ignorados || []
    updateGasto(g.id, { ignorados: lista.includes(k) ? lista.filter((x) => x !== k) : [...lista, k] })
  }

  function encerrarFixo(g) {
    // para de repetir a partir do mês que está sendo visto
    updateGasto(g.id, { fim: addMonths(mesRef, -1) })
  }

  function remover(g) {
    if (g.recorrencia !== 'unico' && !window.confirm('Remover este gasto de todos os meses?')) return
    removeGasto(g.id)
  }

  function rotulo(g) {
    if (g.recorrencia === 'fixo') return 'fixo todo mês'
    if (g.recorrencia === 'parcelado') return `parcela ${g.parcelaN}/${g.numParcelas}`
    return null
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
          <p className="text-brand-600 text-xs uppercase tracking-widest mb-1">Gastos</p>
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
            className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2.5 rounded-card transition-colors shrink-0"
          >
            + Adicionar gasto
          </button>
        </div>
      </header>

      <AvisoDuplicadas duplicadas={duplicadas} onMarcar={(id) => updateGasto(id, { ehParcela: true })} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Saldo em conta (informado)" value={formatMoney(saldoConta)} accent="gold" />
        <StatCard
          label="Gastos deste mês"
          value={formatMoney(totals.totalGastosMes)}
          hint={`${formatMoney(totals.gastosPassadosMes)} já saíram · ${formatMoney(totals.gastosAgendadosMes)} agendados`}
          accent="clay"
        />
        <StatCard
          label="Projeção do fim do mês"
          value={formatMoney(totals.projecaoFimMes)}
          hint="saldo + ainda vai cair − parcelas pendentes − gastos agendados"
          accent={totals.projecaoFimMes < 0 ? 'clay' : 'teal'}
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
              {gastosMes.itens.map((g) => {
                const apagado = g.ehParcela || g.naoSaiu
                const tag = rotulo(g)
                return (
                  <li key={`${g.id}-${g.data}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon categoria={g.categoria} size={36} />
                      <div className="min-w-0">
                        <p className="text-ink-900 text-sm truncate">{g.nome}</p>
                        <p className="text-ink-500 text-xs mt-0.5">
                          {g.categoria} · {formatDate(g.data)}
                          {tag && ` · ${tag}`}
                          {g.naoSaiu && ' · não saiu'}
                          {g.data > hojeISO && !apagado && ' · agendado'}
                          {g.ehParcela && ' · já está em Dívidas (não soma aqui)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                      <span className={`ledger-number text-sm w-24 text-right ${apagado ? 'text-ink-300 line-through' : 'text-clay-600'}`}>
                        {formatMoney(g.valor)}
                      </span>
                      {g.recorrencia !== 'unico' ? (
                        <button onClick={() => toggleNaoSaiu(g)} className="text-ink-500 hover:text-brand-700 text-xs">
                          {g.naoSaiu ? 'Voltar a contar' : 'Não saiu'}
                        </button>
                      ) : (
                        <button
                          onClick={() => updateGasto(g.id, { ehParcela: !g.ehParcela })}
                          className="text-ink-500 hover:text-brand-700 text-xs"
                        >
                          {g.ehParcela ? 'Contar como gasto' : 'Está em Dívidas?'}
                        </button>
                      )}
                      {g.recorrencia === 'fixo' && (
                        <button onClick={() => encerrarFixo(g)} className="text-ink-500 hover:text-brand-700 text-xs">
                          Encerrar
                        </button>
                      )}
                      <button
                        onClick={() => remover(g)}
                        aria-label={`Remover ${g.nome}`}
                        className="text-ink-500 hover:text-clay-600 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                )
              })}
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
                  <span className="flex items-center gap-2 text-ink-700">
                    <CategoryIcon categoria={c.name} size={26} />
                    {c.name}
                  </span>
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
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
              autoFocus
              required
            />
          </div>
          <p className="text-ink-500 text-xs -mt-2">
            Informe o saldo real de hoje. Gastos com data até hoje já foram descontados dele; os agendados (data futura) entram só na projeção do fim do mês.
          </p>
          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
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
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-ink-700 text-xs block mb-1.5">Quando sai</label>
            <div className="grid grid-cols-3 gap-1 bg-paper-200 rounded-full p-0.5">
              {[['unico', 'Uma vez'], ['parcelado', 'Parcelado'], ['fixo', 'Fixo todo mês']].map(([k, l]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setForm({ ...form, recorrencia: k })}
                  className={`py-1.5 text-xs rounded-full transition-colors ${
                    form.recorrencia === k ? 'bg-white text-brand-700 font-medium shadow-card' : 'text-ink-500'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {form.recorrencia === 'fixo' && (
              <p className="text-ink-500 text-xs mt-2">
                Entra sozinho todo mês, no mesmo dia. Se um mês não sair, marque "Não saiu" na lista.
              </p>
            )}
          </div>
          {form.recorrencia === 'parcelado' && (
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">Em quantas vezes</label>
              <input
                type="number"
                min="2"
                max="60"
                step="1"
                value={form.numParcelas}
                onChange={(e) => setForm({ ...form, numParcelas: e.target.value })}
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
                required
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">
                {form.recorrencia === 'parcelado' ? 'Valor de cada parcela (R$)' : 'Valor (R$)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                placeholder="0,00"
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="text-ink-700 text-xs block mb-1.5">
                {form.recorrencia === 'unico' ? 'Data' : form.recorrencia === 'parcelado' ? 'Data da 1ª parcela' : 'Data do 1º mês'}
              </label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full bg-paper-100 border border-line rounded-card px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>
          {form.recorrencia === 'unico' && (
            <label className="flex items-start gap-2 text-xs text-ink-700">
              <input
                type="checkbox"
                checked={form.ehParcela}
                onChange={(e) => setForm({ ...form, ehParcela: e.target.checked })}
                className="mt-0.5 accent-[#22A06B]"
              />
              Este valor já está cadastrado em Dívidas (não somar duas vezes)
            </label>
          )}
          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium py-2.5 rounded-card transition-colors"
          >
            Salvar gasto
          </button>
        </form>
      </Modal>
    </div>
  )
}
