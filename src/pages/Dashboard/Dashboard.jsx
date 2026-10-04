import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext.jsx'
import Card from '../../components/common/Card.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import ExpensesDonut from '../../components/charts/ExpensesDonut.jsx'
import BalanceTrend from '../../components/charts/BalanceTrend.jsx'
import TechnicalChart from '../../components/charts/TechnicalChart.jsx'
import CategoryIcon, { CATEGORY_COLORS } from '../../components/common/CategoryIcon.jsx'
import AvisoDuplicadas from '../../components/common/AvisoDuplicadas.jsx'
import { acharParcelasDuplicadas } from '../../utils/gastos.js'
import { computeResumoMes } from '../../utils/resumoMes.js'
import { formatMoney } from '../../utils/format.js'
import { currentMonthRef, addMonths, monthLabel } from '../../utils/renda.js'

export default function Dashboard() {
  const { salarios, totals, dividas, economias, gastos, saldoConta, updateGasto } = useFinance()
  const [mesRef, setMesRef] = useState(() => currentMonthRef())
  const [abertas, setAbertas] = useState({})

  const resumo = useMemo(
    () => computeResumoMes({ salarios, dividas, gastos, saldoConta }, mesRef),
    [salarios, dividas, gastos, saldoConta, mesRef]
  )
  const rendaMes = resumo.renda
  const dividaMes = resumo.divida
  const gastosMes = resumo.gastos
  const saldoLivre = resumo.saldoLivre
  const duplicadas = useMemo(
    () => acharParcelasDuplicadas(gastosMes.itens, dividaMes.itens),
    [gastosMes, dividaMes]
  )

  // Entrada e saída são do mês selecionado; investido é o total já guardado nas metas.
  const donutData = [
    { name: 'Parcelas do mês', value: dividaMes.totalParcelasMes },
    { name: 'Gastos do mês', value: gastosMes.total },
    { name: 'Saldo livre', value: Math.max(0, saldoLivre) }
  ]

  const barData = [
    { name: 'Entrada', valor: rendaMes.totalLivre },
    { name: 'Saída', valor: gastosMes.total + dividaMes.totalParcelasMes },
    { name: 'Investido', valor: totals.totalEconomizado }
  ]

  const metasEmAndamento = economias.slice(0, 3)

  const topCategorias = gastosMes.porCategoria.slice(0, 6)
  const maiorCategoria = topCategorias[0]?.value || 0

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const situacaoLabel = rendaMes.isFutureMonth
    ? 'previsão para este mês'
    : rendaMes.isPastMonth
      ? 'mês encerrado'
      : 'atualizado automaticamente, conforme os dias chegam'

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{saudacao}!</h1>
          <p className="text-ink-500 text-sm mt-1">Veja como estão suas finanças neste mês.</p>
        </div>

        <div className="flex items-center gap-2 bg-paper-50 border border-line rounded-full px-2 py-1.5 shadow-card">
          <button
            onClick={() => setMesRef((m) => addMonths(m, -1))}
            aria-label="Mês anterior"
            className="w-7 h-7 flex items-center justify-center rounded-full text-ink-700 hover:bg-brand-50 hover:text-brand-700"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-ink-900 min-w-[136px] text-center capitalize">
            {monthLabel(mesRef.year, mesRef.month)}
          </span>
          <button
            onClick={() => setMesRef((m) => addMonths(m, 1))}
            aria-label="Próximo mês"
            className="w-7 h-7 flex items-center justify-center rounded-full text-ink-700 hover:bg-brand-50 hover:text-brand-700"
          >
            ›
          </button>
        </div>
      </header>

      <AvisoDuplicadas
        duplicadas={duplicadas}
        onMarcar={(id) => updateGasto(id, { ehParcela: true })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-brand-700 text-white rounded-card shadow-card p-6">
            <p className="text-white/70 text-sm">Saldo em conta</p>
            <p className="ledger-number text-4xl mt-1">{formatMoney(totals.saldoContaAtual)}</p>
            {resumo.projecaoFim !== null ? (
              <p className="text-white/70 text-xs mt-2">
                Projeção para o fim do mês:{' '}
                <span className="ledger-number text-white">{formatMoney(resumo.projecaoFim)}</span>
                <span className="text-white/50"> (saldo + ainda vai cair − parcelas pendentes − gastos agendados)</span>
              </p>
            ) : (
              <p className="text-white/70 text-xs mt-2">
                Resultado do mês:{' '}
                <span className="ledger-number text-white">{formatMoney(saldoLivre)}</span>
                <span className="text-white/50"> (renda livre − parcelas − gastos)</span>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white/70 text-xs">Renda livre prevista</p>
                <p className="ledger-number text-lg mt-0.5 text-[#9BE8C0]">+ {formatMoney(rendaMes.totalLivre)}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white/70 text-xs">Gastos do mês</p>
                <p className="ledger-number text-lg mt-0.5 text-[#FFB4AA]">- {formatMoney(gastosMes.total)}</p>
              </div>
            </div>
            {rendaMes.totalRestrito > 0 && (
              <p className="text-white/60 text-xs mt-3">
                {formatMoney(rendaMes.totalRestrito)} de vale (só alimentação) ficam fora da renda livre.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Já caiu"
              value={formatMoney(rendaMes.totalRecebido)}
              hint={
                rendaMes.totalRestritoRecebido > 0
                  ? `inclui ${formatMoney(rendaMes.totalRestritoRecebido)} de vale (só alimentação)`
                  : situacaoLabel
              }
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
              hint="renda livre − parcelas − gastos do mês"
              accent={saldoLivre < 0 ? 'clay' : 'paper'}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-display text-base text-ink-900 mb-4">Maiores gastos no mês</h2>
            {topCategorias.length === 0 ? (
              <p className="text-ink-500 text-sm">
                Nenhum gasto neste mês.{' '}
                <Link to="/gastos" className="text-brand-600 font-medium hover:underline">Registrar um gasto</Link>
              </p>
            ) : (
              <ul className="space-y-4">
                {topCategorias.map((c) => {
                  const aberta = Boolean(abertas[c.name])
                  const itens = gastosMes.contados.filter((g) => (g.categoria || 'Outros') === c.name)
                  return (
                    <li key={c.name}>
                      <button
                        type="button"
                        onClick={() => setAbertas((o) => ({ ...o, [c.name]: !o[c.name] }))}
                        aria-expanded={aberta}
                        aria-label={`${aberta ? 'Ocultar' : 'Ver'} gastos de ${c.name}`}
                        className="w-full flex items-center gap-3 text-left"
                      >
                        <CategoryIcon categoria={c.name} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-900">{c.name}</span>
                            <span className="ledger-number text-ink-700">{formatMoney(c.value)}</span>
                          </div>
                          <div className="h-1.5 bg-paper-200 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full rounded-full" style={{ width: `${(c.value / maiorCategoria) * 100}%`, background: CATEGORY_COLORS[c.name] || '#22A06B' }} />
                          </div>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round"
                          className={`shrink-0 text-ink-500 transition-transform ${aberta ? 'rotate-180' : ''}`}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {aberta && (
                        <ul className="mt-2 ml-[52px] space-y-1.5">
                          {itens.map((g) => (
                            <li key={g.id} className="flex items-center justify-between gap-3 text-xs text-ink-700">
                              <span className="truncate">{g.nome}</span>
                              <span className="ledger-number shrink-0 text-ink-500">{formatMoney(g.valor)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
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
                      item.recebido ? 'bg-brand-50 text-teal-600' : 'bg-paper-200 text-ink-700'
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
                      item.paga ? 'bg-brand-50 text-teal-600' : 'bg-paper-200 text-ink-700'
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

      <Card className="mb-6">
        <h2 className="font-display text-lg text-ink-900 mb-1">Análise técnica do saldo</h2>
        <p className="text-ink-500 text-xs mb-4">Candles do saldo, com linha de tendência baseada nos gastos previstos</p>
        <TechnicalChart />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-lg text-ink-900 mb-1">Entrada x Saída x Investido</h2>
          <p className="text-ink-500 text-xs mb-2">Entrada = renda livre e saída = gastos + parcelas, do mês selecionado; investido = total já guardado nas metas</p>
          <BalanceTrend data={barData} />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg text-ink-900 mb-1">Distribuição</h2>
          <p className="text-ink-500 text-xs mb-2">Para onde a renda livre do mês está indo</p>
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
