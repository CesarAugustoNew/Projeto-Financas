// Análise técnica do saldo: transforma renda, dívidas e gastos em uma série diária de saldo,
// projeta o futuro com base nos gastos previstos e agrupa tudo em candles (mês ou ano).

import { daysInMonth, monthLabel, isRendaRestrita } from './renda.js'
import { monthsBetween } from './dividas.js'
import { ocorrenciasMes } from './gastos.js'

const DAY = 86400000
const dnum = (y, m, d) => Math.round(Date.UTC(y, m, d) / DAY)
const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m: m - 1, d }
}

export function buildAnalise({ salarios: salariosTodos, dividas, gastos: gastosTodos, saldoAtual, timeframe = 'mes', incluirVariaveis = false, today = new Date() }) {
  // Vale-alimentação não é renda livre; gasto marcado como parcela já está em Dívidas.
  const salarios = salariosTodos.filter((s) => !isRendaRestrita(s))
  const gastos = gastosTodos.filter((g) => !g.ehParcela)
  const ty = today.getFullYear()
  const tm = today.getMonth()
  const todayAbs = dnum(ty, tm, today.getDate())
  const offOf = (y, m) => (y - ty) * 12 + (m - tm)

  // O app só conhece o saldo de HOJE (informado por você), então o gráfico começa no mês atual.
  // Meses anteriores seriam inventados (reconstruídos de trás para frente), por isso não existem.
  const minOff = 0

  const startDate = new Date(ty, tm + minOff, 1)
  const startDay = dnum(startDate.getFullYear(), startDate.getMonth(), 1)
  const endDay = dnum(ty + 5, 11, 31)
  const n = endDay - startDay + 1
  const net = new Array(n).fill(0)
  const todayIdx = todayAbs - startDay

  // Receitas e parcelas recorrentes, mês a mês.
  for (let k = minOff; k <= 60 + 11 - tm; k++) {
    const date = new Date(ty, tm + k, 1)
    const y = date.getFullYear()
    const m = date.getMonth()
    const dim = daysInMonth(y, m)
    salarios.forEach((s) => {
      const dia = clamp(Number(s.diaPagamento) || 5, 1, dim)
      net[dnum(y, m, dia) - startDay] += Number(s.valor || 0)
    })
    dividas.forEach((dv) => {
      const idx = monthsBetween(dv.inicio, { year: y, month: m })
      if (idx < 0 || idx >= dv.numParcelas) return
      const dia = clamp(Number(dv.diaVencimento) || 10, 1, dim)
      net[dnum(y, m, dia) - startDay] -= Number(dv.valorParcela || 0)
    })
  }

  // Gastos: fixos, parcelados e agendados entram nas datas certas (passadas e futuras);
  // "não saiu" e gastos que já estão em Dívidas ficam de fora.
  for (let k = minOff; k <= 60 + 11 - tm; k++) {
    const date = new Date(ty, tm + k, 1)
    ocorrenciasMes(gastos, { year: date.getFullYear(), month: date.getMonth() }).forEach((o) => {
      if (o.naoSaiu) return
      const p = parseISO(o.data)
      const i = dnum(p.y, p.m, p.d) - startDay
      if (i >= 0 && i < n) net[i] -= Number(o.valor || 0)
    })
  }

  // Gastos variáveis (de uma vez só) podem virar uma média para prever o futuro, mas só se a pessoa
  // ligar essa opção. Ficam de fora os que têm o mesmo nome de um gasto fixo/parcelado (seriam contados
  // duas vezes, por exemplo lançamentos antigos da mesma conta).
  const norm = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
  const nomesRecorrentes = new Set(gastos.filter((g) => (g.recorrencia || 'unico') !== 'unico').map((g) => norm(g.nome)))
  const variaveis = gastos
    .filter((g) => g.data && (g.recorrencia || 'unico') === 'unico' && !nomesRecorrentes.has(norm(g.nome)))
    .map((g) => {
      const p = parseISO(g.data)
      return { day: dnum(p.y, p.m, p.d), valor: Number(g.valor || 0) }
    })
  let earliest = null
  variaveis.forEach(({ day }) => (earliest = earliest === null ? day : Math.min(earliest, day)))
  const janelaIni = earliest === null ? todayAbs : Math.max(todayAbs - 89, earliest)
  const somaJanela = variaveis
    .filter(({ day }) => day >= janelaIni && day <= todayAbs)
    .reduce((sum, v) => sum + v.valor, 0)
  // Divide por no mínimo 30 dias: poucos dias de uso não viram "média" exagerada.
  const baseDiariaCalc = earliest === null ? 0 : somaJanela / Math.max(todayAbs - janelaIni + 1, 30)
  const baseDiaria = incluirVariaveis ? baseDiariaCalc : 0
  if (baseDiaria > 0) {
    // Mês atual: só falta gastar o que a média prevê MENOS o que já foi gasto de variável neste mês.
    const inicioMes = dnum(ty, tm, 1)
    const fimMes = dnum(ty, tm, daysInMonth(ty, tm))
    const jaGasto = variaveis.filter(({ day }) => day >= inicioMes && day <= todayAbs).reduce((sum, v) => sum + v.valor, 0)
    const restante = Math.max(0, baseDiaria * 30.4 - jaGasto)
    const diasRestantes = fimMes - todayAbs
    for (let i = todayIdx + 1; i < n; i++) {
      if (startDay + i <= fimMes) net[i] -= diasRestantes > 0 ? restante / diasRestantes : 0
      else net[i] -= baseDiaria
    }
  }

  // Saldo diário ancorado no saldo em conta de hoje.
  const bal = new Array(n)
  let acc = 0
  for (let i = 0; i < n; i++) bal[i] = acc += net[i]
  const ajuste = saldoAtual - bal[todayIdx]
  for (let i = 0; i < n; i++) bal[i] += ajuste

  // Agrupa em candles.
  const keyOf = (i) => {
    const d = new Date((startDay + i) * DAY)
    return timeframe === 'ano' ? d.getUTCFullYear() : d.getUTCFullYear() * 12 + d.getUTCMonth()
  }
  const limite = timeframe === 'ano' ? ty + 4 : ty * 12 + tm + 12
  const groups = []
  for (let i = 0; i < n; i++) {
    const k = keyOf(i)
    if (k > limite) break
    const g = groups[groups.length - 1]
    if (g && g.key === k) g.last = i
    else groups.push({ key: k, first: i, last: i })
  }
  const candles = groups.map((g) => {
    const open = bal[g.first] - net[g.first]
    let high = open
    let low = open
    for (let i = g.first; i <= g.last; i++) {
      high = Math.max(high, bal[i])
      low = Math.min(low, bal[i])
    }
    const y = timeframe === 'ano' ? g.key : Math.floor(g.key / 12)
    const m = timeframe === 'ano' ? 0 : g.key % 12
    return {
      open,
      high,
      low,
      close: bal[g.last],
      label: timeframe === 'ano' ? String(y) : `${MESES[m]}/${String(y).slice(2)}`,
      full: timeframe === 'ano' ? String(y) : monthLabel(y, m),
      forecast: g.first > todayIdx,
      current: g.first <= todayIdx && todayIdx <= g.last
    }
  })

  // Indicadores sobre o fechamento: média móvel, bandas e linha de tendência.
  const p = timeframe === 'ano' ? 2 : 3
  const sma = []
  const upper = []
  const lower = []
  candles.forEach((_, i) => {
    const win = candles.slice(Math.max(0, i - p + 1), i + 1).map((c) => c.close)
    const mean = win.reduce((s, v) => s + v, 0) / win.length
    sma.push(mean)
    if (win.length < 2) {
      upper.push(null)
      lower.push(null)
    } else {
      const sd = Math.sqrt(win.reduce((s, v) => s + (v - mean) ** 2, 0) / win.length)
      upper.push(mean + 2 * sd)
      lower.push(mean - 2 * sd)
    }
  })

  const cn = candles.length
  const xs = candles.map((_, i) => i)
  const ys = candles.map((c) => c.close)
  const mx = xs.reduce((s, v) => s + v, 0) / cn
  const my = ys.reduce((s, v) => s + v, 0) / cn
  const den = xs.reduce((s, v) => s + (v - mx) ** 2, 0)
  const slope = den === 0 ? 0 : xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / den
  const intercept = my - slope * mx
  const trend = xs.map((x) => intercept + slope * x)

  // Conta do próximo mês, para explicar a previsão com números.
  const prox = new Date(ty, tm + 1, 1)
  const py = prox.getFullYear()
  const pm = prox.getMonth()
  const dimProx = daysInMonth(py, pm)
  const rendaProx = salarios.reduce((sum, s) => sum + Number(s.valor || 0), 0)
  const parcelasProx = dividas.reduce((sum, d) => {
    const idx = monthsBetween(d.inicio, { year: py, month: pm })
    return idx >= 0 && idx < d.numParcelas ? sum + Number(d.valorParcela || 0) : sum
  }, 0)
  const fixosProx = ocorrenciasMes(gastos, { year: py, month: pm })
    .filter((o) => !o.naoSaiu)
    .reduce((sum, o) => sum + Number(o.valor || 0), 0)
  const variaveisProx = baseDiaria * dimProx
  const proximoMes = {
    renda: rendaProx,
    parcelas: parcelasProx,
    fixos: fixosProx,
    variaveis: variaveisProx,
    resultado: rendaProx - parcelasProx - fixosProx - variaveisProx
  }

  return {
    candles,
    proximoMes,
    sma,
    upper,
    lower,
    trend,
    slope,
    incluirVariaveis,
    gastoMensalPrevisto: baseDiariaCalc * 30.4
  }
}
