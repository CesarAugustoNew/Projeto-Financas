// Regra única das contas do mês (renda livre, parcelas e gastos), usada no painel e em Gastos.
// - Parcelas de dívida entram SÓ como dívida (gasto marcado como parcela não soma de novo).
// - Vale-alimentação não entra na renda livre.
// - Saldo livre = renda livre − parcelas do mês − gastos do mês.
// - Projeção do fim do mês (só mês atual) = saldo em conta + ainda vai cair (livre)
//   − parcelas pendentes − gastos agendados (com data futura). Gastos já datados até hoje
//   são considerados descontados do saldo em conta que você informou.

import { computeRendaMes } from './renda.js'
import { computeDividaMes } from './dividas.js'
import { computeGastosMes } from './gastos.js'

export function computeResumoMes({ salarios, dividas, gastos, saldoConta }, monthRef, today = new Date()) {
  const renda = computeRendaMes(salarios, monthRef, today)
  const divida = computeDividaMes(dividas, monthRef, today)
  const g = computeGastosMes(gastos, monthRef, today)
  const saldoLivre = renda.totalLivre - divida.totalParcelasMes - g.total
  const projecaoFim = renda.isCurrentMonth
    ? Number(saldoConta || 0) + renda.totalAReceberLivre - divida.totalPendenteMes - g.totalAgendado
    : null
  return { renda, divida, gastos: g, saldoLivre, projecaoFim }
}
