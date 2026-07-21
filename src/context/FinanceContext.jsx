import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { computeDividaResumoGlobal } from '../utils/dividas.js'

const FinanceContext = createContext(null)

const seedSalarios = []
const seedEconomias = []
const seedDividas = []

export function FinanceProvider({ children }) {
  const [salarios, setSalarios] = useLocalStorage('financas:salarios', seedSalarios)
  const [economias, setEconomias] = useLocalStorage('financas:economias', seedEconomias)
  const [dividas, setDividas] = useLocalStorage('financas:dividas', seedDividas)

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
    removeDivida: (id) => setDividas((prev) => prev.filter((d) => d.id !== id))
  }), [setSalarios, setEconomias, setDividas])

  const totals = useMemo(() => {
    const totalRenda = salarios.reduce((sum, s) => sum + Number(s.valor || 0), 0)
    const totalEconomizado = economias.reduce((sum, e) => sum + Number(e.valorAtual || 0), 0)
    const totalMetaEconomias = economias.reduce((sum, e) => sum + Number(e.meta || 0), 0)

    const resumoDividas = computeDividaResumoGlobal(dividas)
    const totalDividas = resumoDividas.totalDividas
    const totalPagoDividas = resumoDividas.totalPago
    const totalDividasRestante = resumoDividas.totalRestante

    const saldoLivre = totalRenda - totalDividasRestante - totalEconomizado

    return {
      totalRenda,
      totalEconomizado,
      totalMetaEconomias,
      totalDividas,
      totalPagoDividas,
      totalDividasRestante,
      saldoLivre
    }
  }, [salarios, economias, dividas])

  const value = { salarios, economias, dividas, totals, ...actions }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance precisa estar dentro de <FinanceProvider>')
  return ctx
}
