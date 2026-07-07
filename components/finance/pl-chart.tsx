'use client'

import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area,
} from 'recharts'

interface ChartData {
  month: string
  income: number
  expenses: number
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface2 border border-cyan/20 p-3 shadow-[0_0_20px_rgba(0,200,255,0.1)]">
        <p className="font-orbitron text-xs text-cyan mb-2 tracking-widest">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="font-rajdhani text-sm" style={{ color: p.color }}>
            {p.name}: £{p.value.toLocaleString()}
          </p>
        ))}
        {payload.length >= 2 && (
          <p className="font-rajdhani text-xs text-textMuted mt-1 border-t border-border pt-1">
            Net: £{((payload[0]?.value || 0) - (payload[1]?.value || 0)).toLocaleString()}
          </p>
        )}
      </div>
    )
  }
  return null
}

export function PlChart({ data }: { data: ChartData[] }) {
  const netData = data.map(d => ({ ...d, net: d.income - d.expenses }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={netData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00c8ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00c8ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,33,55,0.8)" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Orbitron' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={v => `£${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontFamily: 'Orbitron', fontSize: 10, color: '#64748b' }} />
        <Bar
          dataKey="income" name="INCOME" fill="#00c8ff"
          radius={[3, 3, 0, 0]} opacity={0.85}
          isAnimationActive animationDuration={800} animationEasing="ease-out"
        />
        <Bar
          dataKey="expenses" name="EXPENSES" fill="#7b2fff"
          radius={[3, 3, 0, 0]} opacity={0.85}
          isAnimationActive animationDuration={800} animationEasing="ease-out"
        />
        <Area
          type="monotone" dataKey="net" name="NET"
          stroke="#00ff88" strokeWidth={2} fill="url(#incomeGrad)"
          dot={{ fill: '#00ff88', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#00ff88', stroke: 'rgba(0,255,136,0.4)', strokeWidth: 4 }}
          isAnimationActive animationDuration={1200} animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
