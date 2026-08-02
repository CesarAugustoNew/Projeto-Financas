// Lógica de gastos: cada gasto tem valor, categoria e data. A partir disso,
// calculamos o total gasto no mês e o total por categoria, para estatísticas.

import { currentMonthRef } from './renda.js'

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
  return new Date().toISOString().slice(0, 10)
}

function isMesmoMes(dataISO, { year, month }) {
  if (!dataISO) return false
  const d = new Date(dataISO + 'T00:00:00')
  return d.getFullYear() === year && d.getMonth() === month
}

/**
 * Filtra os gastos de um mês/ano específico e calcula o total geral
 * e o total agrupado por categoria (para o gráfico de estatísticas).
 */
export function computeGastosMes(gastos, monthRef = currentMonthRef()) {
  const itens = gastos
    .filter((g) => isMesmoMes(g.data, monthRef))
    .sort((a, b) => new Date(b.data) - new Date(a.data))

  const total = itens.reduce((sum, g) => sum + Number(g.valor || 0), 0)

  const porCategoriaMap = itens.reduce((acc, g) => {
    const cat = g.categoria || 'Outros'
    acc[cat] = (acc[cat] || 0) + Number(g.valor || 0)
    return acc
  }, {})

  const porCategoria = Object.entries(porCategoriaMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return { itens, total, porCategoria }
}
