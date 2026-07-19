import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from '../../utils/format.js'

const COLORS = ['#2F9483', '#BD554B', '#C89A2E', '#9DA398']

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
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(value)}
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E3E0D5',
              borderRadius: 10,
              color: '#1B211C',
              fontSize: 12
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
