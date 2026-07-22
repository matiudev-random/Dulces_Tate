import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert } from '../lib/database.types'

export type Pago = Tables<'pagos'>

interface PagosState {
  pagos: Pago[]
  loading: boolean
  error: string | null
  fetchPagos: () => Promise<void>
  addPago: (input: TablesInsert<'pagos'>) => Promise<void>
}

export const usePagosStore = create<PagosState>((set, get) => ({
  pagos: [],
  loading: false,
  error: null,

  fetchPagos: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    set({ pagos: data, loading: false })
  },

  addPago: async (input) => {
    const { data, error } = await supabase
      .from('pagos')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    set({ pagos: [data, ...get().pagos] })
  },
}))
