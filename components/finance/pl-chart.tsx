'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  month: string
  income: number
  expenses: number
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface2 border border-border p-3">
        <p className="font-orbitron text-xs text-textMuted mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="font-rajdhani text-sm" style={{ color: p.color }}>
            {p.name}: £{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function PlChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#0d2137" />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Orbitron' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontFamily: 'Orbitron', fontSize: 10, color: '#64748b' }} />
        <Bar dataKey="income" name="INCOME" fill="#00c8ff" radius={[2, 2, 0, 0]} />
        <Bar dataKey="expenses" name="EXPENSES" fill="#7b2fff" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
