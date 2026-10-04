// Lógica de renda recorrente: cada salário/renda tem um dia fixo do mês em que "cai".
// A partir disso, calculamos automaticamente o que já foi recebido e o que ainda vai
// entrar, para qualquer mês (passado, atual ou futuro), sem precisar editar nada.

/** Vale-alimentação/refeição só paga mercado e restaurante: não é renda livre. */
export function isRendaRestrita(s) {
  return /vale|alimenta|refei|\bvr\b|\bva\b/i.test(`${s.tipo || ''} ${s.nome || ''}`)
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function monthLabel(year, month) {
  const date = new Date(year, month, 1)
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function addMonths({ year, month }, delta) {
  const date = new Date(year, month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function currentMonthRef(today = new Date()) {
  return { year: today.getFullYear(), month: today.getMonth() }
}

/**
 * Calcula o status de cada renda recorrente para um mês/ano específico,
 * comparando o dia de pagamento cadastrado com a data de hoje.
 */
export function computeRendaMes(salarios, { year, month }, today = new Date()) {
  const isPastMonth =
    year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())
  const isFutureMonth =
    year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())
  const isCurrentMonth = !isPastMonth && !isFutureMonth
  const totalDiasMes = daysInMonth(year, month)

  const itens = salarios.map((s) => {
    const dia = Math.min(Math.max(Number(s.diaPagamento) || 5, 1), totalDiasMes)
    const dataPagamento = new Date(year, month, dia)
    const recebido = isPastMonth || (isCurrentMonth && today.getDate() >= dia)
    return { ...s, diaEfetivo: dia, dataPagamento, recebido, restrito: isRendaRestrita(s) }
  })

  const totalPrevisto = itens.reduce((sum, i) => sum + Number(i.valor || 0), 0)
  const totalRecebido = itens.filter((i) => i.recebido).reduce((sum, i) => sum + Number(i.valor || 0), 0)
  const totalAReceber = totalPrevisto - totalRecebido
  const soma = (arr) => arr.reduce((sum, i) => sum + Number(i.valor || 0), 0)
  const totalRestrito = soma(itens.filter((i) => i.restrito))
  const totalRestritoRecebido = soma(itens.filter((i) => i.restrito && i.recebido))
  const totalLivre = totalPrevisto - totalRestrito
  const totalAReceberLivre = totalAReceber - (totalRestrito - totalRestritoRecebido)

  return {
    itens: itens.sort((a, b) => a.diaEfetivo - b.diaEfetivo),
    totalPrevisto,
    totalRecebido,
    totalAReceber,
    totalRestrito,
    totalRestritoRecebido,
    totalLivre,
    totalAReceberLivre,
    isPastMonth,
    isFutureMonth,
    isCurrentMonth
  }
}
