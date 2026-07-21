// Lógica de dívidas parceladas: cada dívida tem valor da parcela, quantidade de
// parcelas, dia de vencimento e mês de início. A partir disso, o app calcula
// sozinho em qual parcela cada dívida está, mês a mês, sem precisar marcar
// pagamento manualmente.

import { daysInMonth } from './renda.js'

export function monthsBetween(inicio, alvo) {
  return (alvo.year - inicio.year) * 12 + (alvo.month - inicio.month)
}

export function addMonthsToRef({ year, month }, delta) {
  const date = new Date(year, month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

/**
 * Status da(s) parcela(s) de cada dívida para um mês/ano específico.
 */
export function computeDividaMes(dividas, monthRef, today = new Date()) {
  const isPastMonth =
    monthRef.year < today.getFullYear() ||
    (monthRef.year === today.getFullYear() && monthRef.month < today.getMonth())
  const isFutureMonth =
    monthRef.year > today.getFullYear() ||
    (monthRef.year === today.getFullYear() && monthRef.month > today.getMonth())
  const isCurrentMonth = !isPastMonth && !isFutureMonth

  const itens = dividas
    .map((d) => {
      const idx = monthsBetween(d.inicio, monthRef)
      if (idx < 0 || idx >= d.numParcelas) return null

      const totalDiasMes = daysInMonth(monthRef.year, monthRef.month)
      const diaEfetivo = Math.min(Math.max(Number(d.diaVencimento) || 10, 1), totalDiasMes)
      const paga = isPastMonth || (isCurrentMonth && today.getDate() >= diaEfetivo)

      return {
        ...d,
        parcelaAtual: idx + 1,
        diaEfetivo,
        paga
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.diaEfetivo - b.diaEfetivo)

  const totalParcelasMes = itens.reduce((sum, i) => sum + Number(i.valorParcela || 0), 0)
  const totalPagoMes = itens.filter((i) => i.paga).reduce((sum, i) => sum + Number(i.valorParcela || 0), 0)
  const totalPendenteMes = totalParcelasMes - totalPagoMes

  return { itens, totalParcelasMes, totalPagoMes, totalPendenteMes, isPastMonth, isFutureMonth, isCurrentMonth }
}

/**
 * Resumo geral (independente do mês navegado no painel): quanto já foi pago
 * até hoje e quanto ainda falta, considerando todas as parcelas vencidas.
 */
export function computeDividaResumoGlobal(dividas, today = new Date()) {
  const hojeRef = { year: today.getFullYear(), month: today.getMonth() }

  return dividas.reduce(
    (acc, d) => {
      const idx = monthsBetween(d.inicio, hojeRef)
      const totalDiasMesAtual = daysInMonth(hojeRef.year, hojeRef.month)
      const diaEfetivo = Math.min(Math.max(Number(d.diaVencimento) || 10, 1), totalDiasMesAtual)

      let parcelasPagas
      if (idx < 0) {
        parcelasPagas = 0
      } else if (idx >= d.numParcelas) {
        parcelasPagas = d.numParcelas
      } else {
        // parcelas de meses totalmente anteriores já venceram; a do mês atual
        // conta como paga só se o dia de vencimento já passou
        parcelasPagas = idx + (today.getDate() >= diaEfetivo ? 1 : 0)
      }

      const valorTotal = d.numParcelas * Number(d.valorParcela || 0)
      const valorPago = parcelasPagas * Number(d.valorParcela || 0)
      const valorRestante = valorTotal - valorPago

      return {
        totalDividas: acc.totalDividas + valorTotal,
        totalPago: acc.totalPago + valorPago,
        totalRestante: acc.totalRestante + valorRestante
      }
    },
    { totalDividas: 0, totalPago: 0, totalRestante: 0 }
  )
}
