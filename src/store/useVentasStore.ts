import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../lib/database.types'

export type Venta = Tables<'ventas'>

interface VentasState {
  ventas: Venta[]
  loading: boolean
  error: string | null
  fetchVentas: () => Promise<void>
  addVenta: (input: TablesInsert<'ventas'>) => Promise<void>
  updateVenta: (id: string, input: TablesUpdate<'ventas'>) => Promise<void>
  marcarPagado: (id: string, fechaPago: string) => Promise<void>
  marcarNoPagado: (id: string) => Promise<void>
}

export const useVentasStore = create<VentasState>((set, get) => ({
  ventas: [],
  loading: false,
  error: null,

  fetchVentas: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    set({ ventas: data, loading: false })
  },

  addVenta: async (input) => {
    const { data, error } = await supabase
      .from('ventas')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    set({ ventas: [data, ...get().ventas] })
  },

  updateVenta: async (id, input) => {
    const { data, error } = await supabase
      .from('ventas')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    set({ ventas: get().ventas.map((v) => (v.id === id ? data : v)) })
  },

  marcarPagado: async (id, fechaPago) => {
    const { data, error } = await supabase
      .from('ventas')
      .update({ estado: 'pagado', fecha_pago: fechaPago })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    set({ ventas: get().ventas.map((v) => (v.id === id ? data : v)) })
  },

  marcarNoPagado: async (id) => {
    const { data, error } = await supabase
      .from('ventas')
      .update({ estado: 'no_pagado', fecha_pago: null })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    set({ ventas: get().ventas.map((v) => (v.id === id ? data : v)) })
  },
}))
