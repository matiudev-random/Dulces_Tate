import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { usePagosStore, type Pago } from '../store/usePagosStore'
import { formatCurrency, formatDate, todayISODate } from '../lib/format'
import { DateField } from './DateField'

type Filtro = 'todos' | 'ingreso' | 'gasto'

export function PagosView() {
  const { pagos, loading, fetchPagos } = usePagosStore()
  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  useEffect(() => {
    fetchPagos()
  }, [fetchPagos])

  const resumen = useMemo(() => {
    let ingresos = 0
    let costosAsignados = 0
    let costosGastados = 0
    let ganancia = 0
    let tarjeta = 0
    let inversion = 0

    for (const p of pagos) {
      if (p.tipo === 'ingreso') {
        ingresos += p.monto
        costosAsignados += p.costo ?? 0
        ganancia += p.ganancia ?? 0
        tarjeta += p.tarjeta_credito ?? 0
        inversion += p.inversion ?? 0
      } else {
        costosGastados += p.monto
      }
    }

    return {
      ingresos,
      costosAsignados,
      costosGastados,
      saldoParaCostos: costosAsignados - costosGastados,
      ganancia,
      tarjeta,
      inversion,
      resultadoNeto: ingresos - costosGastados,
    }
  }, [pagos])

  const pagosFiltrados = useMemo(
    () => (filtro === 'todos' ? pagos : pagos.filter((p) => p.tipo === filtro)),
    [pagos, filtro],
  )

  return (
    <div className="mx-auto max-w-lg px-5 py-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass-deep">
          Movimientos
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-brass/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink hover:border-brass hover:bg-brass/10"
        >
          {showForm ? 'Cancelar' : '+ Pago'}
        </button>
      </div>

      <ResumenPagos resumen={resumen} />

      {showForm && <PagoForm onSaved={() => setShowForm(false)} onCancel={() => setShowForm(false)} />}

      <div className="mt-5 flex gap-2">
        {(['todos', 'ingreso', 'gasto'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
              filtro === f
                ? 'bg-ink text-paper-raised'
                : 'border border-brass/40 text-ink-soft hover:border-brass'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'ingreso' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
      </div>

      {loading && pagos.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-ink-soft">
          Cargando movimientos...
        </p>
      ) : pagosFiltrados.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-ink-soft">
          No hay movimientos para mostrar.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {pagosFiltrados.map((pago) => (
            <PagoRow key={pago.id} pago={pago} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResumenRow({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'sage' | 'blush'
}) {
  const toneClass =
    tone === 'sage' ? 'text-sage-deep' : tone === 'blush' ? 'text-blush-deep' : 'text-ink'

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
        {label}
      </span>
      <span className={`font-mono text-sm font-semibold ${toneClass}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

function ResumenPagos({
  resumen,
}: {
  resumen: {
    ingresos: number
    costosAsignados: number
    costosGastados: number
    saldoParaCostos: number
    ganancia: number
    tarjeta: number
    inversion: number
    resultadoNeto: number
  }
}) {
  return (
    <div className="mt-4 border border-brass/30 bg-paper-raised px-5 py-4">
      <p className="font-display text-lg italic text-ink">Resumen</p>
      <div className="mt-2 divide-y divide-dotted divide-brass/30">
        <ResumenRow label="Ingresos" value={resumen.ingresos} tone="sage" />
        <ResumenRow label="Costos asignados" value={resumen.costosAsignados} />
        <ResumenRow label="Costos gastados" value={resumen.costosGastados} tone="blush" />
        <ResumenRow label="Saldo para costos" value={resumen.saldoParaCostos} />
        <ResumenRow label="Ganancia" value={resumen.ganancia} />
        <ResumenRow label="Tarjeta de crédito" value={resumen.tarjeta} />
        <ResumenRow label="Inversión" value={resumen.inversion} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t-2 border-double border-brass pt-3">
        <span className="font-display text-lg italic text-ink">Resultado neto</span>
        <span
          className={`font-mono text-xl font-bold ${
            resumen.resultadoNeto >= 0 ? 'text-sage-deep' : 'text-blush-deep'
          }`}
        >
          {formatCurrency(resumen.resultadoNeto)}
        </span>
      </div>
    </div>
  )
}

function PagoRow({ pago }: { pago: Pago }) {
  const ingreso = pago.tipo === 'ingreso'
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="relative overflow-hidden border border-brass/25 bg-paper-raised px-5 py-4">
      <span
        className={`pointer-events-none absolute right-0 top-0 h-5 w-5 [clip-path:polygon(100%_0,0_0,100%_100%)] ${
          ingreso ? 'bg-sage/70' : 'bg-blush/70'
        }`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setExpandido((v) => !v)}
            className="flex w-full items-start gap-1.5 text-left"
          >
            <p
              className={`font-display text-lg text-ink ${
                expandido ? 'whitespace-pre-wrap break-words' : 'truncate'
              }`}
            >
              {pago.detalle}
            </p>
            <span
              className={`mt-2 shrink-0 text-[10px] text-brass-deep transition-transform ${
                expandido ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft/80">
            {formatDate(pago.fecha)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-mono text-base font-bold ${
              ingreso ? 'text-sage-deep' : 'text-blush-deep'
            }`}
          >
            {ingreso ? '+' : '−'} {formatCurrency(pago.monto)}
          </p>
          <span
            className={`mt-1.5 inline-block -rotate-2 rounded-sm border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
              ingreso
                ? 'border-sage-deep/50 text-sage-deep'
                : 'border-blush-deep/50 text-blush-deep'
            }`}
          >
            {ingreso ? 'Ingreso' : 'Gasto'}
          </span>
        </div>
      </div>
    </div>
  )
}

function PagoForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { addPago } = usePagosStore()
  const [fecha, setFecha] = useState(todayISODate())
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('ingreso')
  const [detalle, setDetalle] = useState('')
  const [monto, setMonto] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addPago({
        fecha,
        tipo,
        detalle,
        monto: Number(monto),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const fieldLabelClass = 'font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft'
  const fieldInputClass =
    'mt-1.5 w-full border-0 border-b border-brass/40 bg-transparent pb-1.5 text-sm text-ink outline-none focus:border-brass-deep'

  const montoNum = Number(monto)
  const preview = monto && !Number.isNaN(montoNum) && montoNum > 0

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 flex flex-col gap-5 border border-brass/25 bg-paper-raised px-5 py-5"
    >
      <DateField label="Fecha" value={fecha} onChange={setFecha} required />

      <label className="block">
        <span className={fieldLabelClass}>Tipo</span>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'ingreso' | 'gasto')}
          className={fieldInputClass}
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </label>

      <label className="block">
        <span className={fieldLabelClass}>Detalle</span>
        <input
          required
          placeholder="Ej: venta del día, pago de arriendo..."
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          className={fieldInputClass}
        />
      </label>

      <label className="block">
        <span className={fieldLabelClass}>Monto</span>
        <input
          required
          type="number"
          min={0.01}
          step="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className={`${fieldInputClass} font-mono`}
        />
      </label>

      {preview && (
        <div className="border border-dashed border-brass/40 px-3 py-2.5 font-mono text-xs text-ink-soft">
          <p className="text-ink">
            Monto final: {tipo === 'gasto' ? '−' : '+'} {formatCurrency(montoNum)}
          </p>
          {tipo === 'ingreso' ? (
            <p className="mt-1">
              Costo 40% {formatCurrency(montoNum * 0.4)} · Ganancia 30%{' '}
              {formatCurrency(montoNum * 0.3)} · Tarjeta 20% {formatCurrency(montoNum * 0.2)} ·
              Inversión 10% {formatCurrency(montoNum * 0.1)}
            </p>
          ) : (
            <p className="mt-1">Se descuenta del sobre de costos.</p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-blush-deep">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-brass/40 py-2 text-sm text-ink-soft hover:border-brass hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-brass py-2 text-sm font-medium text-paper-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:bg-brass-deep disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
