import { useEffect, useRef, useState } from 'react'

interface DateFieldProps {
  label: string
  value: string // ISO yyyy-mm-dd
  onChange: (iso: string) => void
  required?: boolean
}

function clamp(value: string, min: number, max: number, len: number): string {
  if (value.length < len) return value
  const n = Math.min(max, Math.max(min, Number(value)))
  return String(n).padStart(len, '0')
}

// Input de fecha segmentado en DD / MM / AAAA: garantiza el mismo orden y
// formato en cualquier dispositivo, sin depender del locale del navegador
// (a diferencia de <input type="date">, que siempre respeta el idioma del SO).
export function DateField({ label, value, onChange, required }: DateFieldProps) {
  const [dd, setDd] = useState('')
  const [mm, setMm] = useState('')
  const [yyyy, setYyyy] = useState('')

  const mmRef = useRef<HTMLInputElement>(null)
  const yyyyRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const [y, m, d] = value ? value.split('-') : ['', '', '']
    setYyyy(y ?? '')
    setMm(m ?? '')
    setDd(d ?? '')
  }, [value])

  const commit = (nextDd: string, nextMm: string, nextYyyy: string) => {
    if (nextDd.length === 2 && nextMm.length === 2 && nextYyyy.length === 4) {
      onChange(`${nextYyyy}-${nextMm}-${nextDd}`)
    }
  }

  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-1.5 border-b border-brass/40 pb-1.5 focus-within:border-brass-deep">
        <input
          required={required}
          inputMode="numeric"
          placeholder="DD"
          maxLength={2}
          value={dd}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 2)
            setDd(v)
            if (v.length === 2) mmRef.current?.focus()
            commit(v, mm, yyyy)
          }}
          onBlur={(e) => {
            const v = clamp(e.target.value, 1, 31, 2)
            setDd(v)
            commit(v, mm, yyyy)
          }}
          className="w-6 border-0 bg-transparent text-sm text-ink outline-none"
        />
        <span className="text-ink-soft/50">-</span>
        <input
          ref={mmRef}
          required={required}
          inputMode="numeric"
          placeholder="MM"
          maxLength={2}
          value={mm}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 2)
            setMm(v)
            if (v.length === 2) yyyyRef.current?.focus()
            commit(dd, v, yyyy)
          }}
          onBlur={(e) => {
            const v = clamp(e.target.value, 1, 12, 2)
            setMm(v)
            commit(dd, v, yyyy)
          }}
          className="w-6 border-0 bg-transparent text-sm text-ink outline-none"
        />
        <span className="text-ink-soft/50">-</span>
        <input
          ref={yyyyRef}
          required={required}
          inputMode="numeric"
          placeholder="AAAA"
          maxLength={4}
          value={yyyy}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4)
            setYyyy(v)
            commit(dd, mm, v)
          }}
          className="w-11 border-0 bg-transparent text-sm text-ink outline-none"
        />
      </div>
    </label>
  )
}
