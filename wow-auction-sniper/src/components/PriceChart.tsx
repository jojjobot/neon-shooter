'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface DataPoint {
  date: string
  close: number
  high?: number
  low?: number
  open?: number
}

interface Props {
  data: DataPoint[]
  height?: number
}

function formatGold(copper: number): string {
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  return `${g.toLocaleString()}g ${s}s`
}

function formatTick(copper: number): string {
  const g = copper / 10000
  return g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${Math.round(g)}g`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-wow-card border border-wow-border rounded-lg px-3 py-2.5 text-sm shadow-xl">
      <p className="text-wow-muted text-xs mb-1">{label}</p>
      <p className="text-wow-gold font-mono font-bold">{formatGold(payload[0].value)}</p>
    </div>
  )
}

export default function PriceChart({ data, height = 300 }: Props) {
  if (!data || data.length === 0) return null

  const avg = data.reduce((s, d) => s + d.close, 0) / data.length

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
          tickFormatter={(v) => {
            const d = new Date(v)
            return `${d.getMonth() + 1}/${d.getDate()}`
          }}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatTick}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avg}
          stroke="#8b949e"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#c8a84b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#c8a84b', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
