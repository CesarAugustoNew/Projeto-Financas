import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney } from '../../utils/format.js'

export default function BalanceTrend({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE1" vertical={false} />
          <XAxis dataKey="name" stroke="#6E756E" fontSize={12} tickLine={false} axisLine={{ stroke: '#E3E0D5' }} />
          <YAxis
            stroke="#6E756E"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${Math.round(v / 1000)}k`}
          />
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
          <Bar dataKey="valor" radius={[6, 6, 0, 0]} fill="#C89A2E" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
