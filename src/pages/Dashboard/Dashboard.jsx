import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import ExpensesDonut from '../../components/charts/ExpensesDonut.jsx'
import BalanceTrend from '../../components/charts/BalanceTrend.jsx'
import { formatMoney } from '../../utils/format.js'

export default function Dashboard() {
  const { totals, dividas, economias } = useFinance()

  const donutData = [
    { name: 'Economias', value: totals.totalEconomizado },
    { name: 'Dívidas restantes', value: totals.totalDividasRestante },
    { name: 'Saldo livre', value: Math.max(0, totals.saldoLivre) }
  ]

  const barData = [
    { name: 'Renda', valor: totals.totalRenda },
    { name: 'Dívidas', valor: totals.totalDividasRestante },
    { name: 'Economias', valor: totals.totalEconomizado }
  ]

  const proximasDividas = [...dividas]
    .sort((a, b) => (a.vencimento || '').localeCompare(b.vencimento || ''))
    .slice(0, 3)

  const metasEmAndamento = economias.slice(0, 3)

  return (
    <div>
      <header className="mb-8">
        <p className="text-gold-600 text-xs uppercase tracking-widest mb-1">Painel</p>
        <h1 className="font-display text-3xl text-ink-900">Visão geral das finanças</h1>
        <p className="text-ink-500 text-sm mt-2">
          Um retrato claro de quanto entra, quanto está guardado e quanto ainda se deve.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Renda total" value={formatMoney(totals.totalRenda)} accent="gold" />
        <StatCard
          label="Economizado"
          value={formatMoney(totals.totalEconomizado)}
          hint={totals.totalMetaEconomias > 0 ? `Meta: ${formatMoney(totals.totalMetaEconomias)}` : null}
          accent="teal"
        />
        <StatCard
          label="Dívidas restantes"
          value={formatMoney(totals.totalDividasRestante)}
          hint={totals.totalDividas > 0 ? `de ${formatMoney(totals.totalDividas)}` : null}
          accent="clay"
        />
        <StatCard
          label="Saldo livre"
          value={formatMoney(totals.saldoLivre)}
          hint="renda − dívidas − economias"
          accent={totals.saldoLivre < 0 ? 'clay' : 'paper'}
        />
      </div>

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
          <h2 className="font-display text-lg text-ink-900 mb-4">Próximas dívidas</h2>
          {proximasDividas.length === 0 ? (
            <p className="text-ink-500 text-sm">Nenhuma dívida cadastrada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {proximasDividas.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-ink-900">{d.nome}</p>
                    <p className="text-ink-500 text-xs">Vencimento: {d.vencimento || '—'}</p>
                  </div>
                  <span className="ledger-number text-clay-600">
                    {formatMoney(Math.max(0, d.valorTotal - (d.pago || 0)))}
                  </span>
                </li>
              ))}
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
