import { useState, type SubmitEvent } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setInfo('Cuenta creada. Revisá tu email para confirmarla y después iniciá sesión.')
        setMode('signin')
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
        {/* Ribbon bookmark */}
        <div className="absolute -top-3 right-8 h-9 w-6 bg-blush-deep [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" />

        <div className="relative border border-brass/40 bg-paper-raised px-8 pb-9 pt-10 shadow-[0_1px_2px_rgba(74,55,53,0.06),0_12px_28px_-12px_rgba(74,55,53,0.25)]">
          {/* Corner brackets */}
          <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-brass" />
          <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-brass" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-brass" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-brass" />

          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-brass-deep">
              Registro diario
            </p>
            <h1 className="mt-2 font-display text-4xl italic text-ink">
              Libro de Ventas
            </h1>
            <p className="mt-2 text-xs tracking-wide text-ink-soft">
              {mode === 'signin' ? 'Iniciá sesión para continuar' : 'Creá tu cuenta de acceso'}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-5">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full border-0 border-b border-brass/40 bg-transparent pb-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-brass-deep"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Contraseña
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full border-0 border-b border-brass/40 bg-transparent pb-1.5 text-sm text-ink outline-none focus:border-brass-deep"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 text-center text-xs text-blush-deep">{error}</p>
          )}
          {info && (
            <p className="mt-4 text-center text-xs text-sage-deep">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-brass py-2.5 text-sm font-medium tracking-wide text-paper-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-colors hover:bg-brass-deep disabled:opacity-50"
          >
            {loading ? 'Un momento...' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setInfo(null)
            }}
            className="mt-5 w-full text-center text-xs text-ink-soft underline decoration-brass/40 decoration-dotted underline-offset-4 hover:text-ink"
          >
            {mode === 'signin'
              ? '¿Primera vez? Creá una cuenta'
              : 'Ya tengo cuenta, iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  )
}
