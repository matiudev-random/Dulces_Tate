import { useEffect, useState } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { Login } from './components/Login'
import { VentasView } from './components/VentasView'
import { ProductosView } from './components/ProductosView'
import { PagosView } from './components/PagosView'

type Tab = 'ventas' | 'productos' | 'pagos'

const TAB_LABELS: Record<Tab, string> = {
  ventas: 'Ventas',
  productos: 'Productos',
  pagos: 'Pagos',
}

function App() {
  const { session, loading, init, signOut } = useAuthStore()
  const [tab, setTab] = useState<Tab>('ventas')

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center font-display text-lg italic text-ink-soft">
        Abriendo el libro...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-brass/30 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="font-display text-2xl italic text-ink">{TAB_LABELS[tab]}</h1>
        <button
          onClick={signOut}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass-deep hover:text-ink"
        >
          Salir
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        {tab === 'ventas' && <VentasView />}
        {tab === 'productos' && <ProductosView />}
        {tab === 'pagos' && <PagosView />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-brass/30 bg-paper">
        <div className="mx-auto flex max-w-lg pb-[env(safe-area-inset-bottom)]">
          <TabButton
            label="Ventas"
            active={tab === 'ventas'}
            onClick={() => setTab('ventas')}
          />
          <TabButton
            label="Productos"
            active={tab === 'productos'}
            onClick={() => setTab('productos')}
          />
          <TabButton
            label="Pagos"
            active={tab === 'pagos'}
            onClick={() => setTab('pagos')}
          />
        </div>
      </nav>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`-mt-[1px] flex-1 border-t px-4 py-3 font-display text-base transition-colors ${
        active
          ? 'rounded-t-2xl border-brass/40 bg-paper-raised italic text-ink shadow-[0_-3px_10px_-6px_rgba(74,55,53,0.35)]'
          : 'border-transparent text-ink-soft'
      }`}
    >
      {label}
    </button>
  )
}

export default App
