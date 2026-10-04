import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from '../../utils/format.js'
import { CATEGORY_COLORS } from '../common/CategoryIcon.jsx'

const COLORS = ['#22A06B', '#BD554B', '#E08A00', '#9AA89F']
const NAMED = { 'Parcelas do mês': '#BD554B', 'Gastos do mês': '#E08A00', 'Saldo livre': '#22A06B', ...CATEGORY_COLORS }

export default function ExpensesDonut({ data }) {
  const hasValues = data.some((d) => d.value > 0)

  if (!hasValues) {
    return (
      <div className="h-56 flex items-center justify-center text-ink-500 text-sm">
        Adicione valores para ver a distribuição
      </div>
    )
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={NAMED[d.name] || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(value)}
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #DDE6DF',
              borderRadius: 10,
              color: '#14221A',
              fontSize: 12
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
