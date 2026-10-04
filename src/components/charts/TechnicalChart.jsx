import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useFinance } from '../../context/FinanceContext.jsx'
import { buildAnalise } from '../../utils/analise.js'
import { formatMoney } from '../../utils/format.js'
import { isRendaRestrita } from '../../utils/renda.js'

const H = 340
const M = { l: 64, r: 16, t: 22, b: 30 }
const UP = '#22A06B'
const DOWN = '#BD554B'
const SMA = '#D93636'
const TREND = '#E08A00'

function compact(v) {
  const a = Math.abs(v)
  const s = v < 0 ? '-' : ''
  if (a >= 1e6) return `${s}R$ ${(a / 1e6).toFixed(1).replace('.', ',')}M`
  if (a >= 1000) return `${s}R$ ${(a / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k`
  return `${s}R$ ${Math.round(a)}`
}

function niceTicks(min, max, count = 5) {
  const range = max - min || 1
  const rough = range / (count - 1)
  const mag = 10 ** Math.floor(Math.log10(rough))
  const norm = rough / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const ticks = []
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) ticks.push(t)
  return ticks
}

function Toggle({ on, color, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs rounded-full border px-3 py-1 transition-colors ${
        on ? 'border-brand-500 bg-brand-50 text-ink-900' : 'border-line text-ink-500 opacity-70'
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </button>
  )
}

export default function TechnicalChart() {
  const { salarios, dividas, gastos, totals } = useFinance()
  // Escolhas do gráfico ficam salvas neste navegador: não precisa refazer a cada atualização.
  const [prefs, setPrefs] = useLocalStorage('financas:analisePrefs', { tf: 'mes', sma: true, bands: true, trend: true, variaveis: false })
  const tf = prefs.tf === 'ano' ? 'ano' : 'mes'
  const show = { sma: prefs.sma !== false, bands: prefs.bands !== false, trend: prefs.trend !== false, variaveis: prefs.variaveis === true }
  const setTf = (v) => setPrefs((p) => ({ ...p, tf: v }))
  const setShow = (fn) => setPrefs((p) => ({ ...p, ...fn(show) }))
  const [hover, setHover] = useState(null)
  const [w, setW] = useState(640)
  const wrapRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const a = useMemo(
    () => buildAnalise({ salarios, dividas, gastos, saldoAtual: totals.saldoContaAtual, timeframe: tf, incluirVariaveis: show.variaveis }),
    [salarios, dividas, gastos, totals.saldoContaAtual, tf, show.variaveis]
  )

  const n = a.candles.length
  const step = Math.max(36, (w - M.l - M.r) / n)
  const W = M.l + M.r + step * n
  const cx = (i) => M.l + step * (i + 0.5)
  const curIdx = Math.max(0, a.candles.findIndex((c) => c.current))
  const firstForecast = a.candles.findIndex((c) => c.forecast)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, cx(curIdx) - w * 0.35)
  }, [tf, n, w]) // eslint-disable-line react-hooks/exhaustive-deps

  const vals = [
    ...a.candles.flatMap((c) => [c.high, c.low]),
    ...(show.bands ? [...a.upper, ...a.lower].filter((v) => v !== null) : []),
    ...(show.trend ? a.trend : [])
  ]
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  const pad = (hi - lo || 1) * 0.08
  lo -= pad
  hi += pad
  const y = (v) => M.t + (1 - (v - lo) / (hi - lo)) * (H - M.t - M.b)
  const ticks = niceTicks(lo, hi)

  const path = (arr) =>
    arr.map((v, i) => (v === null ? '' : `${i === 0 || arr[i - 1] === null ? 'M' : 'L'}${cx(i)},${y(v)}`)).join(' ')
  const bandIdx = a.upper.map((v, i) => (v === null ? null : i)).filter((i) => i !== null)
  const bandPoly =
    bandIdx.length > 1
      ? [...bandIdx.map((i) => `${cx(i)},${y(a.upper[i])}`), ...[...bandIdx].reverse().map((i) => `${cx(i)},${y(a.lower[i])}`)].join(' ')
      : ''

  const unit = tf === 'mes' ? 'mês' : 'ano'
  const temRenda = salarios.some((s) => !isRendaRestrita(s))
  // Sem renda e sem saldo, o gráfico só mostraria gastos e despencaria: melhor não desenhar.
  const empty = !temRenda && !totals.saldoContaAtual
  const hv = hover !== null ? a.candles[hover] : null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex bg-paper-200 rounded-full p-0.5" role="group" aria-label="Tempo do candle">
          {[['mes', 'Mês'], ['ano', 'Ano']].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTf(k)}
              className={`px-4 py-1 text-sm rounded-full transition-colors ${
                tf === k ? 'bg-white text-brand-700 font-medium shadow-card' : 'text-ink-500'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Toggle on={show.sma} color={SMA} label="Média móvel" onClick={() => setShow((s) => ({ ...s, sma: !s.sma }))} />
          <Toggle on={show.bands} color="#B9C4BC" label="Bandas" onClick={() => setShow((s) => ({ ...s, bands: !s.bands }))} />
          <Toggle on={show.variaveis} color="#7048D9" label="Média de variáveis" onClick={() => setShow((s) => ({ ...s, variaveis: !s.variaveis }))} />
          <Toggle on={show.trend} color={TREND} label="Tendência" onClick={() => setShow((s) => ({ ...s, trend: !s.trend }))} />
        </div>
      </div>

      {empty ? (
        <p className="text-ink-500 text-sm py-10 text-center">
          Cadastre sua renda (página Salário) e o saldo em conta (página Gastos) para ver a análise. Sem isso o gráfico só mostraria gastos e a linha cairia sempre.
        </p>
      ) : (
        <>
          {!temRenda && (
            <p className="text-xs text-clay-600 mb-3">
              Nenhuma renda cadastrada: a previsão considera só as saídas, por isso o saldo tende a cair.
            </p>
          )}
          <div ref={wrapRef} className="w-full">
            <div ref={scrollRef} className="overflow-x-auto">
              <div className="relative" style={{ width: W }}>
                <svg
                  width={W}
                  height={H}
                  onMouseMove={(e) => {
                    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
                    const i = Math.floor((x - M.l) / step)
                    setHover(i >= 0 && i < n ? i : null)
                  }}
                  onMouseLeave={() => setHover(null)}
                >
                  {ticks.map((t) => (
                    <g key={t}>
                      <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="#E3EBE5" strokeDasharray="3 3" />
                      <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#66756B">{compact(t)}</text>
                    </g>
                  ))}
                  {lo < 0 && hi > 0 && (
                    <line x1={M.l} x2={W - M.r} y1={y(0)} y2={y(0)} stroke="#9AA89F" strokeWidth="1" />
                  )}

                  {firstForecast >= 0 && (
                    <g>
                      <rect x={M.l + step * firstForecast} y={M.t} width={W - M.r - M.l - step * firstForecast} height={H - M.t - M.b} fill="#E8F6EE" opacity="0.55" />
                      <text x={M.l + step * firstForecast + 8} y={M.t + 12} fontSize="10" letterSpacing="1" fill="#168A57">PREVISÃO</text>
                    </g>
                  )}
                  <rect x={M.l + step * curIdx} y={M.t} width={step} height={H - M.t - M.b} fill="#14221A" opacity="0.04" />

                  {show.bands && bandPoly && (
                    <g>
                      <polygon points={bandPoly} fill="#9AA89F" opacity="0.12" />
                      <path d={path(a.upper)} fill="none" stroke="#B9C4BC" strokeWidth="1.5" />
                      <path d={path(a.lower)} fill="none" stroke="#B9C4BC" strokeWidth="1.5" />
                    </g>
                  )}

                  {a.candles.map((c, i) => {
                    const up = c.close >= c.open
                    const col = up ? UP : DOWN
                    const bw = Math.min(26, step * 0.55)
                    const top = y(Math.max(c.open, c.close))
                    const bh = Math.max(2, Math.abs(y(c.open) - y(c.close)))
                    return (
                      <g key={i} opacity={hover === null || hover === i ? 1 : 0.75}>
                        <line x1={cx(i)} x2={cx(i)} y1={y(c.high)} y2={y(c.low)} stroke={col} strokeWidth="1.5" />
                        <rect
                          x={cx(i) - bw / 2}
                          y={top}
                          width={bw}
                          height={bh}
                          rx="2"
                          fill={col}
                          fillOpacity={c.forecast ? 0.4 : 1}
                          stroke={col}
                          strokeWidth="1.5"
                          strokeDasharray={c.forecast ? '3 2' : undefined}
                        />
                        <text x={cx(i)} y={H - 10} textAnchor="middle" fontSize="11" fill={c.current ? '#14221A' : '#66756B'} fontWeight={c.current ? 600 : 400}>
                          {c.label}
                        </text>
                      </g>
                    )
                  })}

                  {show.sma && <path d={path(a.sma)} fill="none" stroke={SMA} strokeWidth="2.5" strokeLinejoin="round" />}
                  {show.trend && (
                    <line x1={cx(0)} y1={y(a.trend[0])} x2={cx(n - 1)} y2={y(a.trend[n - 1])} stroke={TREND} strokeWidth="2" strokeDasharray="7 5" />
                  )}
                  {hover !== null && <line x1={cx(hover)} x2={cx(hover)} y1={M.t} y2={H - M.b} stroke="#14221A" strokeOpacity="0.25" strokeDasharray="2 3" />}
                </svg>

                {hv && (
                  <div
                    className="absolute pointer-events-none bg-white border border-line rounded-xl shadow-card px-3 py-2 text-xs text-ink-700 w-44"
                    style={{ top: 8, left: Math.min(Math.max(cx(hover) + 16, 0), W - 180) }}
                  >
                    <p className="font-medium text-ink-900 mb-1">
                      {hv.full}
                      {hv.forecast && <span className="ml-1.5 text-brand-700 font-normal">(previsto)</span>}
                    </p>
                    {[['Abertura', hv.open], ['Máxima', hv.high], ['Mínima', hv.low], ['Fechamento', hv.close]].map(([l, v]) => (
                      <p key={l} className="flex justify-between gap-2">
                        <span>{l}</span>
                        <span className="ledger-number text-ink-900">{formatMoney(v)}</span>
                      </p>
                    ))}
                    <p className={`flex justify-between gap-2 mt-1 pt-1 border-t border-line ${hv.close >= hv.open ? 'text-teal-600' : 'text-clay-600'}`}>
                      <span>Variação</span>
                      <span className="ledger-number">{hv.close >= hv.open ? '+' : '-'}{formatMoney(Math.abs(hv.close - hv.open))}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-ink-700 space-y-1">
            <p>
              <span className="font-medium" style={{ color: a.slope >= 0 ? UP : DOWN }}>
                {a.slope >= 0 ? 'Tendência de alta' : 'Tendência de queda'}:
              </span>{' '}
              {a.slope >= 0 ? '+' : '-'}{formatMoney(Math.abs(a.slope))} por {unit} no saldo.
            </p>
         
          </div>
        </>
      )}
    </div>
  )
}
