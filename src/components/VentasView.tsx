import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { useVentasStore, type Venta } from '../store/useVentasStore'
import { useProductosStore, type Producto } from '../store/useProductosStore'
import { formatCurrency, formatDate, todayISODate } from '../lib/format'
import { DateField } from './DateField'

type Filtro = 'todas' | 'no_pagado' | 'pagado'

export function VentasView() {
  const { ventas, loading, fetchVentas, marcarPagado, marcarNoPagado } = useVentasStore()
  const { productos, fetchProductos } = useProductosStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Venta | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  useEffect(() => {
    fetchVentas()
    fetchProductos()
  }, [fetchVentas, fetchProductos])

  const productosPorId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos])

  const productosActivos = useMemo(() => productos.filter((p) => p.activo), [productos])

  // Si el producto de la venta que se está editando ya no está activo,
  // lo agregamos igual a la lista para no perder la selección actual.
  const productosParaForm = useMemo(() => {
    if (!editing?.producto_id) return productosActivos
    if (productosActivos.some((p) => p.id === editing.producto_id)) return productosActivos
    const productoActual = productosPorId.get(editing.producto_id)
    return productoActual ? [productoActual, ...productosActivos] : productosActivos
  }, [productosActivos, productosPorId, editing])

  const ventasFiltradas = useMemo(
    () => (filtro === 'todas' ? ventas : ventas.filter((v) => v.estado === filtro)),
    [ventas, filtro],
  )

  const totalPendiente = useMemo(
    () =>
      ventas
        .filter((v) => v.estado === 'no_pagado')
        .reduce((acc, v) => acc + (v.total ?? 0), 0),
    [ventas],
  )

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass-deep">
          Registro
        </p>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm((v) => !v)
          }}
          className="rounded-full border border-brass/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink hover:border-brass hover:bg-brass/10"
        >
          {showForm && !editing ? 'Cancelar' : '+ Venta'}
        </button>
      </div>

      {totalPendiente > 0 && (
        <div className="mt-4 flex items-baseline justify-between border-y border-dashed border-blush-deep/50 bg-blush/25 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blush-deep">
            Pendiente de cobro
          </span>
          <span className="font-mono text-sm font-bold text-ink">
            {formatCurrency(totalPendiente)}
          </span>
        </div>
      )}

      {showForm && (
        <VentaForm
          venta={editing}
          productos={productosParaForm}
          onSaved={closeForm}
          onCancel={closeForm}
        />
      )}

      <div className="mt-5 flex gap-2">
        {(['todas', 'no_pagado', 'pagado'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
              filtro === f
                ? 'bg-ink text-paper-raised'
                : 'border border-brass/40 text-ink-soft hover:border-brass'
            }`}
          >
            {f === 'todas' ? 'Todas' : f === 'pagado' ? 'Cobrado' : 'Pendiente'}
          </button>
        ))}
      </div>

      {loading && ventas.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-ink-soft">
          Cargando ventas...
        </p>
      ) : ventasFiltradas.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-ink-soft">
          No hay ventas para mostrar.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {ventasFiltradas.map((venta) => (
            <VentaRow
              key={venta.id}
              venta={venta}
              nombreProducto={
                (venta.producto_id && productosPorId.get(venta.producto_id)?.nombre) ||
                venta.producto_nombre
              }
              onMarcarPagado={() => marcarPagado(venta.id, todayISODate())}
              onMarcarNoPagado={() => marcarNoPagado(venta.id)}
              onEdit={() => {
                setEditing(venta)
                setShowForm(true)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VentaRow({
  venta,
  nombreProducto,
  onMarcarPagado,
  onMarcarNoPagado,
  onEdit,
}: {
  venta: Venta
  nombreProducto: string
  onMarcarPagado: () => void
  onMarcarNoPagado: () => void
  onEdit: () => void
}) {
  const pagado = venta.estado === 'pagado'

  return (
    <div className="relative overflow-hidden border border-brass/25 bg-paper-raised px-5 py-4">
      <span
        className={`pointer-events-none absolute right-0 top-0 h-5 w-5 [clip-path:polygon(100%_0,0_0,100%_100%)] ${
          pagado ? 'bg-sage/70' : 'bg-blush/70'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-ink">{venta.cliente}</p>
          <p className="truncate text-xs text-ink-soft">
            {nombreProducto} · {venta.cantidad} × {formatCurrency(venta.precio_unitario)}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft/80">
            {formatDate(venta.fecha)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-base font-bold text-ink">
            {formatCurrency(venta.total ?? 0)}
          </p>
          <button
            onClick={pagado ? onMarcarNoPagado : onMarcarPagado}
            className={`mt-1.5 -rotate-2 rounded-sm border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
              pagado
                ? 'border-sage-deep/50 text-sage-deep'
                : 'border-blush-deep/50 text-blush-deep'
            }`}
          >
            {pagado ? 'Cobrado' : 'Pendiente'}
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={onEdit}
          className="rounded-full border border-brass/40 px-3 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft hover:border-brass hover:text-ink"
        >
          Editar
        </button>
        {pagado && venta.fecha_pago && (
          <p className="font-mono text-[10px] text-ink-soft/70">
            cobrado el {formatDate(venta.fecha_pago)}
          </p>
        )}
      </div>
    </div>
  )
}

function VentaForm({
  venta,
  productos,
  onSaved,
  onCancel,
}: {
  venta: Venta | null
  productos: Producto[]
  onSaved: () => void
  onCancel: () => void
}) {
  const { addVenta, updateVenta } = useVentasStore()
  const [fecha, setFecha] = useState(venta?.fecha ?? todayISODate())
  const [cliente, setCliente] = useState(venta?.cliente ?? '')
  const [productoId, setProductoId] = useState(venta?.producto_id ?? '')
  const [precioUnitario, setPrecioUnitario] = useState(
    venta ? String(venta.precio_unitario) : '',
  )
  const [cantidad, setCantidad] = useState(venta ? String(venta.cantidad) : '1')
  const [estado, setEstado] = useState<'no_pagado' | 'pagado'>(
    (venta?.estado as 'no_pagado' | 'pagado') ?? 'no_pagado',
  )
  const [fechaPago, setFechaPago] = useState(venta?.fecha_pago ?? todayISODate())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProductoChange = (id: string) => {
    setProductoId(id)
    const producto = productos.find((p) => p.id === id)
    if (producto) setPrecioUnitario(String(producto.precio_unitario))
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const producto = productos.find((p) => p.id === productoId)
      if (!producto) throw new Error('Elegí un producto')

      const payload = {
        fecha,
        cliente,
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        precio_unitario: Number(precioUnitario),
        cantidad: Number(cantidad),
        estado,
        fecha_pago: estado === 'pagado' ? fechaPago : null,
      }

      if (venta) {
        await updateVenta(venta.id, payload)
      } else {
        await addVenta(payload)
      }
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

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 flex flex-col gap-5 border border-brass/25 bg-paper-raised px-5 py-5"
    >
      <p className="font-display text-lg italic text-ink">
        {venta ? 'Editar venta' : 'Nueva venta'}
      </p>

      <DateField label="Fecha" value={fecha} onChange={setFecha} required />

      <label className="block">
        <span className={fieldLabelClass}>Cliente</span>
        <input
          required
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className={fieldInputClass}
        />
      </label>

      <label className="block">
        <span className={fieldLabelClass}>Producto</span>
        <select
          required
          value={productoId}
          onChange={(e) => handleProductoChange(e.target.value)}
          className={fieldInputClass}
        >
          <option value="" disabled>
            Elegí un producto
          </option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-5">
        <label className="block">
          <span className={fieldLabelClass}>Precio unit.</span>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            className={`${fieldInputClass} font-mono`}
          />
        </label>
        <label className="block">
          <span className={fieldLabelClass}>Cantidad</span>
          <input
            required
            type="number"
            min={0.01}
            step="0.01"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className={`${fieldInputClass} font-mono`}
          />
        </label>
      </div>

      <label className="block">
        <span className={fieldLabelClass}>Estado</span>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as 'no_pagado' | 'pagado')}
          className={fieldInputClass}
        >
          <option value="no_pagado">Pendiente</option>
          <option value="pagado">Cobrado</option>
        </select>
      </label>

      {estado === 'pagado' && (
        <DateField label="Fecha de cobro" value={fechaPago} onChange={setFechaPago} required />
      )}

      {precioUnitario && cantidad && (
        <p className="font-mono text-sm text-ink">
          Total: {formatCurrency(Number(precioUnitario) * Number(cantidad))}
        </p>
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
