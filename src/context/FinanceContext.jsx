import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { computeDividaResumoGlobal } from '../utils/dividas.js'
import { computeGastosMes } from '../utils/gastos.js'
import { currentMonthRef } from '../utils/renda.js'

const FinanceContext = createContext(null)

const seedSalarios = []
const seedEconomias = []
const seedDividas = []
const seedGastos = []

export function FinanceProvider({ children }) {
  const [salarios, setSalarios] = useLocalStorage('financas:salarios', seedSalarios)
  const [economias, setEconomias] = useLocalStorage('financas:economias', seedEconomias)
  const [dividas, setDividas] = useLocalStorage('financas:dividas', seedDividas)
  const [gastos, setGastos] = useLocalStorage('financas:gastos', seedGastos)
  const [saldoConta, setSaldoConta] = useLocalStorage('financas:saldoConta', 0)

  const actions = useMemo(() => ({
    // Salário / renda
    addSalario: (item) => setSalarios((prev) => [...prev, { id: crypto.randomUUID(), ...item }]),
    removeSalario: (id) => setSalarios((prev) => prev.filter((s) => s.id !== id)),
    updateSalario: (id, patch) =>
      setSalarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),

    // Economias / metas
    addEconomia: (item) =>
      setEconomias((prev) => [...prev, { id: crypto.randomUUID(), valorAtual: 0, ...item }]),
    removeEconomia: (id) => setEconomias((prev) => prev.filter((e) => e.id !== id)),
    aportarEconomia: (id, valor) =>
      setEconomias((prev) =>
        prev.map((e) => (e.id === id ? { ...e, valorAtual: Math.max(0, (e.valorAtual || 0) + valor) } : e))
      ),

    // Dívidas parceladas — acompanham os meses sozinhas a partir do cadastro
    addDivida: (item) => setDividas((prev) => [...prev, { id: crypto.randomUUID(), ...item }]),
    removeDivida: (id) => setDividas((prev) => prev.filter((d) => d.id !== id)),

    // Gastos por categoria
    addGasto: (item) => setGastos((prev) => [...prev, { id: crypto.randomUUID(), ...item }]),
    removeGasto: (id) => setGastos((prev) => prev.filter((g) => g.id !== id)),
    updateGasto: (id, patch) =>
      setGastos((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g))),

    // Saldo em conta (o que você tem hoje, informado manualmente)
    updateSaldoConta: (valor) => setSaldoConta(Number(valor) || 0)
  }), [setSalarios, setEconomias, setDividas, setGastos, setSaldoConta])

  const totals = useMemo(() => {
    const totalRenda = salarios.reduce((sum, s) => sum + Number(s.valor || 0), 0)
    const totalEconomizado = economias.reduce((sum, e) => sum + Number(e.valorAtual || 0), 0)
    const totalMetaEconomias = economias.reduce((sum, e) => sum + Number(e.meta || 0), 0)

    const resumoDividas = computeDividaResumoGlobal(dividas)
    const totalDividas = resumoDividas.totalDividas
    const totalPagoDividas = resumoDividas.totalPago
    const totalDividasRestante = resumoDividas.totalRestante

    const saldoLivre = totalRenda - totalDividasRestante - totalEconomizado

    const gastosMes = computeGastosMes(gastos, currentMonthRef())
    const totalGastosMes = gastosMes.total
    const gastosPorCategoria = gastosMes.porCategoria
    const saldoContaAtual = Number(saldoConta || 0)
    const saldoDisponivel = saldoContaAtual - totalGastosMes

    return {
      totalRenda,
      totalEconomizado,
      totalMetaEconomias,
      totalDividas,
      totalPagoDividas,
      totalDividasRestante,
      saldoLivre,
      totalGastosMes,
      gastosPorCategoria,
      saldoContaAtual,
      saldoDisponivel
    }
  }, [salarios, economias, dividas, gastos, saldoConta])

  const value = { salarios, economias, dividas, gastos, saldoConta, totals, ...actions }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance precisa estar dentro de <FinanceProvider>')
  return ctx
}
