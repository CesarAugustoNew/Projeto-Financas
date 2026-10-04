// Lógica de gastos: cada gasto tem valor, categoria e data. A partir disso,
// calculamos o total gasto no mês e o total por categoria, para estatísticas.

import { currentMonthRef, daysInMonth } from './renda.js'
import { monthsBetween } from './dividas.js'

export const CATEGORIAS_GASTO = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Compras',
  'Assinaturas',
  'Outros'
]

export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const pad = (n) => String(n).padStart(2, '0')
export const monthKey = ({ year, month }) => `${year}-${pad(month + 1)}`

/**
 * Ocorrências dos gastos em um mês. Cada gasto tem uma recorrência:
 * - "unico": acontece só na data informada;
 * - "parcelado": repete por N meses (parcela 1/N, 2/N...), mesmo dia do mês;
 * - "fixo": repete todo mês a partir da data, até o mês de "fim" (se houver).
 * "ignorados" guarda os meses ("2026-10") em que o gasto recorrente NÃO saiu.
 */
export function ocorrenciasMes(gastos, monthRef) {
  const out = []
  gastos.forEach((g) => {
    if (!g.data) return
    const [y, m, d] = g.data.split('-').map(Number)
    const idx = monthsBetween({ year: y, month: m - 1 }, monthRef)
    const rec = g.recorrencia || 'unico'
    let parcelaN = null
    if (rec === 'unico') {
      if (idx !== 0) return
    } else if (rec === 'parcelado') {
      if (idx < 0 || idx >= Number(g.numParcelas || 1)) return
      parcelaN = idx + 1
    } else {
      if (idx < 0) return
      if (g.fim && monthsBetween(g.fim, monthRef) > 0) return
    }
    const dia = Math.min(d, daysInMonth(monthRef.year, monthRef.month))
    const data = rec === 'unico' ? g.data : `${monthRef.year}-${pad(monthRef.month + 1)}-${pad(dia)}`
    const naoSaiu = (g.ignorados || []).includes(monthKey(monthRef))
    out.push({ ...g, data, recorrencia: rec, parcelaN, naoSaiu })
  })
  return out
}

/**
 * Filtra os gastos de um mês/ano. Gastos marcados como "parcela de dívida" aparecem na
 * lista, mas NÃO entram nos totais (a parcela já é contada em Dívidas).
 * - totalPassado: gastos com data até hoje (já saíram da conta)
 * - totalAgendado: gastos com data futura (ainda vão sair)
 */
export function computeGastosMes(gastos, monthRef = currentMonthRef(), today = new Date()) {
  const itens = ocorrenciasMes(gastos, monthRef).sort((a, b) => new Date(b.data) - new Date(a.data))
  // Não contam: gasto que já está em Dívidas e ocorrência marcada como "não saiu".
  const contados = itens.filter((g) => !g.ehParcela && !g.naoSaiu)
  const hoje0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const futuro = (g) => new Date(g.data + 'T00:00:00') > hoje0
  const soma = (arr) => arr.reduce((sum, g) => sum + Number(g.valor || 0), 0)

  const total = soma(contados)
  const totalAgendado = soma(contados.filter(futuro))
  const totalPassado = total - totalAgendado

  const porCategoriaMap = contados.reduce((acc, g) => {
    const cat = g.categoria || 'Outros'
    acc[cat] = (acc[cat] || 0) + Number(g.valor || 0)
    return acc
  }, {})
  const porCategoria = Object.entries(porCategoriaMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return { itens, contados, total, totalPassado, totalAgendado, porCategoria }
}

/** Gastos com o mesmo valor de uma parcela do mês: provável contagem em dobro. */
export function acharParcelasDuplicadas(itens, parcelas) {
  const usados = new Set()
  const res = []
  parcelas.forEach((p) => {
    const g = itens.find(
      (x) => !x.ehParcela && !x.naoSaiu && !usados.has(x.id) && Math.abs(Number(x.valor) - Number(p.valorParcela)) < 0.005
    )
    if (g) {
      usados.add(g.id)
      res.push({ gasto: g, divida: p })
    }
  })
  return res
}
