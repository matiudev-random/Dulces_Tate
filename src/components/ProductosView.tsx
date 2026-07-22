import { useEffect, useState, type SubmitEvent } from 'react'
import { useProductosStore, type Producto } from '../store/useProductosStore'
import { formatCurrency } from '../lib/format'

export function ProductosView() {
  const { productos, loading, fetchProductos, updateProducto } = useProductosStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const activos = productos.filter((p) => p.activo)
  const inactivos = productos.filter((p) => !p.activo)

  return (
    <div className="mx-auto max-w-lg px-5 py-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass-deep">
          Catálogo
        </p>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm((v) => !v)
          }}
          className="rounded-full border border-brass/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink hover:border-brass hover:bg-brass/10"
        >
          {showForm && !editing ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <ProductoForm
          producto={editing}
          onSaved={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      {loading && productos.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-ink-soft">
          Cargando productos...
        </p>
      ) : productos.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-ink-soft">
          Todavía no hay nada en el catálogo.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {activos.map((producto) => (
            <ProductoRow
              key={producto.id}
              producto={producto}
              onEdit={() => {
                setEditing(producto)
                setShowForm(true)
              }}
              onToggleActivo={() =>
                updateProducto(producto.id, { activo: !producto.activo })
              }
            />
          ))}

          {inactivos.length > 0 && (
            <>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
                Fuera de catálogo
              </p>
              {inactivos.map((producto) => (
                <ProductoRow
                  key={producto.id}
                  producto={producto}
                  onEdit={() => {
                    setEditing(producto)
                    setShowForm(true)
                  }}
                  onToggleActivo={() =>
                    updateProducto(producto.id, { activo: !producto.activo })
                  }
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ProductoRow({
  producto,
  onEdit,
  onToggleActivo,
}: {
  producto: Producto
  onEdit: () => void
  onToggleActivo: () => void
}) {
  return (
    <div
      className={`relative flex items-center justify-between overflow-hidden border border-brass/25 bg-paper-raised px-5 py-3.5 ${
        producto.activo ? '' : 'opacity-55'
      }`}
    >
      <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 bg-blush/70 [clip-path:polygon(100%_0,0_0,100%_100%)]" />

      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-ink">{producto.nombre}</p>
        <p className="font-mono text-xs text-ink-soft">
          {formatCurrency(producto.precio_unitario)}
        </p>
      </div>
      <div className="ml-3 flex shrink-0 gap-2">
        <button
          onClick={onEdit}
          className="rounded-full border border-brass/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft hover:border-brass hover:text-ink"
        >
          Editar
        </button>
        <button
          onClick={onToggleActivo}
          className="rounded-full border border-brass/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft hover:border-brass hover:text-ink"
        >
          {producto.activo ? 'Retirar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

function ProductoForm({
  producto,
  onSaved,
  onCancel,
}: {
  producto: Producto | null
  onSaved: () => void
  onCancel: () => void
}) {
  const { addProducto, updateProducto } = useProductosStore()
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [precio, setPrecio] = useState(
    producto ? String(producto.precio_unitario) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const precio_unitario = Number(precio)
      if (producto) {
        await updateProducto(producto.id, { nombre, precio_unitario })
      } else {
        await addProducto({ nombre, precio_unitario })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 flex flex-col gap-5 border border-brass/25 bg-paper-raised px-5 py-5"
    >
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Nombre del producto
        </span>
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mt-1.5 w-full border-0 border-b border-brass/40 bg-transparent pb-1.5 text-sm text-ink outline-none focus:border-brass-deep"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Precio unitario
        </span>
        <input
          required
          type="number"
          min={0}
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="mt-1.5 w-full border-0 border-b border-brass/40 bg-transparent pb-1.5 font-mono text-sm text-ink outline-none focus:border-brass-deep"
        />
      </label>

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
