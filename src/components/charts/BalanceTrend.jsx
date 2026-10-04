import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney } from '../../utils/format.js'

export default function BalanceTrend({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8} margin={{ top: 20, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3EBE5" vertical={false} />
          <XAxis dataKey="name" stroke="#66756B" fontSize={12} tickLine={false} axisLine={{ stroke: '#DDE6DF' }} />
          <YAxis
            stroke="#66756B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `R$${(v / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k` : `R$${v}`)}
            allowDecimals={false}
            width={56}
          />
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
          <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={90}>
            {data.map((_, i) => (
              <Cell key={i} fill={['#22A06B', '#BD554B', '#0F6E45'][i % 3]} />
            ))}
            <LabelList dataKey="valor" position="top" fontSize={11} fill="#3F4F45" formatter={(v) => formatMoney(v)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
