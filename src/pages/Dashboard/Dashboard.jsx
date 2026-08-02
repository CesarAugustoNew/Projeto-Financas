import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import ExpensesDonut from '../../components/charts/ExpensesDonut.jsx'
import BalanceTrend from '../../components/charts/BalanceTrend.jsx'
import { formatMoney } from '../../utils/format.js'
import { computeRendaMes, currentMonthRef, addMonths, monthLabel } from '../../utils/renda.js'
import { computeDividaMes } from '../../utils/dividas.js'

export default function Dashboard() {
  const { salarios, totals, dividas, economias } = useFinance()
  const [mesRef, setMesRef] = useState(() => currentMonthRef())

  const rendaMes = useMemo(() => computeRendaMes(salarios, mesRef), [salarios, mesRef])
  const dividaMes = useMemo(() => computeDividaMes(dividas, mesRef), [dividas, mesRef])

  const donutData = [
    { name: 'Economias', value: totals.totalEconomizado },
    { name: 'Dívidas restantes', value: totals.totalDividasRestante },
    { name: 'Saldo livre', value: Math.max(0, rendaMes.totalPrevisto - totals.totalDividasRestante - totals.totalEconomizado) }
  ]

  const barData = [
    { name: 'Renda do mês', valor: rendaMes.totalPrevisto },
    { name: 'Dívidas', valor: totals.totalDividasRestante },
    { name: 'Economias', valor: totals.totalEconomizado }
  ]

  const saldoLivre = rendaMes.totalPrevisto - totals.totalDividasRestante - totals.totalEconomizado

  const metasEmAndamento = economias.slice(0, 3)

  const situacaoLabel = rendaMes.isFutureMonth
    ? 'previsão para este mês'
    : rendaMes.isPastMonth
      ? 'mês encerrado'
      : 'atualizado automaticamente, conforme os dias chegam'

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold-600 text-xs uppercase tracking-widest mb-1">Painel</p>
          <h1 className="font-display text-3xl text-ink-900">Visão geral das finanças</h1>
          <p className="text-ink-500 text-sm mt-2">
            Um retrato claro de quanto entra, quanto está guardado e quanto ainda se deve.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-paper-100 border border-line rounded-card px-2 py-1.5">
          <button
            onClick={() => setMesRef((m) => addMonths(m, -1))}
            aria-label="Mês anterior"
            className="w-7 h-7 flex items-center justify-center rounded-md text-ink-700 hover:bg-paper-200 hover:text-ink-900"
          >
            ‹
          </button>
          <span className="ledger-number text-sm text-ink-900 min-w-[136px] text-center capitalize">
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
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Renda prevista no mês" value={formatMoney(rendaMes.totalPrevisto)} accent="gold" />
        <StatCard
          label="Já caiu"
          value={formatMoney(rendaMes.totalRecebido)}
          hint={situacaoLabel}
          accent="teal"
        />
        <StatCard
          label="Ainda vai cair"
          value={formatMoney(rendaMes.totalAReceber)}
          accent={rendaMes.totalAReceber > 0 ? 'paper' : 'teal'}
        />
        <StatCard
          label="Saldo livre"
          value={formatMoney(saldoLivre)}
          hint="renda do mês − dívidas − economias"
          accent={saldoLivre < 0 ? 'clay' : 'paper'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Saldo em conta" value={formatMoney(totals.saldoContaAtual)} accent="gold" />
        <StatCard label="Gastos deste mês" value={formatMoney(totals.totalGastosMes)} accent="clay" />
        <StatCard
          label="Saldo disponível"
          value={formatMoney(totals.saldoDisponivel)}
          hint="saldo em conta − gastos do mês"
          accent={totals.saldoDisponivel < 0 ? 'clay' : 'teal'}
        />
      </div>

      {rendaMes.itens.length > 0 && (
        <Card className="mb-8">
          <h2 className="font-display text-lg text-ink-900 mb-1">Calendário de renda do mês</h2>
          <p className="text-ink-500 text-xs mb-4">Cadastrado uma vez, o status muda sozinho conforme a data chega.</p>
          <ul className="divide-y divide-line">
            {rendaMes.itens.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-ink-900 text-sm">{item.nome}</p>
                  <p className="text-ink-500 text-xs">Dia {item.diaEfetivo}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      item.recebido ? 'bg-[#EAF5F2] text-teal-600' : 'bg-paper-200 text-ink-700'
                    }`}
                  >
                    {item.recebido ? 'Recebido' : 'A receber'}
                  </span>
                  <span className="ledger-number text-ink-900 text-sm w-24 text-right">
                    {formatMoney(item.valor)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {dividaMes.itens.length > 0 && (
        <Card className="mb-8">
          <h2 className="font-display text-lg text-ink-900 mb-1">Parcelas de dívidas do mês</h2>
          <p className="text-ink-500 text-xs mb-4">
            Cada dívida acompanha o calendário sozinha, mostrando em qual parcela você está.
          </p>
          <ul className="divide-y divide-line">
            {dividaMes.itens.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-ink-900 text-sm">{item.nome}</p>
                  <p className="text-ink-500 text-xs">
                    Parcela {item.parcelaAtual}/{item.numParcelas} · dia {item.diaEfetivo}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      item.paga ? 'bg-[#EAF5F2] text-teal-600' : 'bg-paper-200 text-ink-700'
                    }`}
                  >
                    {item.paga ? 'Paga' : 'Pendente'}
                  </span>
                  <span className="ledger-number text-clay-600 text-sm w-24 text-right">
                    {formatMoney(item.valorParcela)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-lg text-ink-900 mb-1">Renda x Dívidas x Economias</h2>
          <p className="text-ink-500 text-xs mb-2">Comparativo em reais</p>
          <BalanceTrend data={barData} />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg text-ink-900 mb-1">Distribuição</h2>
          <p className="text-ink-500 text-xs mb-2">Para onde a renda está indo</p>
          <ExpensesDonut data={donutData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-lg text-ink-900 mb-1">Dívidas em aberto</h2>
          <p className="text-ink-500 text-xs mb-4">Total restante a pagar de cada uma, a partir de hoje.</p>
          {dividas.length === 0 ? (
            <p className="text-ink-500 text-sm">Nenhuma dívida cadastrada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {dividas.map((d) => {
                const idxHoje =
                  (new Date().getFullYear() - d.inicio.year) * 12 + (new Date().getMonth() - d.inicio.month)
                const parcelasDecorridas = Math.min(Math.max(idxHoje, 0), d.numParcelas)
                const restante = Math.max(0, (d.numParcelas - parcelasDecorridas) * d.valorParcela)
                if (restante <= 0) return null
                return (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-ink-900">{d.nome}</p>
                      <p className="text-ink-500 text-xs">
                        {parcelasDecorridas}/{d.numParcelas} parcelas pagas
                      </p>
                    </div>
                    <span className="ledger-number text-clay-600">{formatMoney(restante)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink-900 mb-4">Metas de economia</h2>
          {metasEmAndamento.length === 0 ? (
            <p className="text-ink-500 text-sm">Nenhuma meta cadastrada ainda.</p>
          ) : (
            <ul className="space-y-4">
              {metasEmAndamento.map((e) => {
                const pct = e.meta > 0 ? Math.min(100, ((e.valorAtual || 0) / e.meta) * 100) : 0
                return (
                  <li key={e.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-ink-900">{e.nome}</span>
                      <span className="ledger-number text-teal-600">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-paper-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
