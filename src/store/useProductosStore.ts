import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../lib/database.types'

export type Producto = Tables<'productos'>

interface ProductosState {
  productos: Producto[]
  loading: boolean
  error: string | null
  fetchProductos: () => Promise<void>
  addProducto: (input: TablesInsert<'productos'>) => Promise<void>
  updateProducto: (id: string, input: TablesUpdate<'productos'>) => Promise<void>
}

export const useProductosStore = create<ProductosState>((set, get) => ({
  productos: [],
  loading: false,
  error: null,

  fetchProductos: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    set({ productos: data, loading: false })
  },

  addProducto: async (input) => {
    const { data, error } = await supabase
      .from('productos')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    set({
      productos: [...get().productos, data].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      ),
    })
  },

  updateProducto: async (id, input) => {
    const { data, error } = await supabase
      .from('productos')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    set({
      productos: get()
        .productos.map((p) => (p.id === id ? data : p))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    })
  },
}))
