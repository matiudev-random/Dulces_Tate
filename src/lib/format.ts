const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
})

const todayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

// Toda la app muestra fechas en dd-mm-yyyy, sin depender del locale del
// dispositivo. isoDate viene siempre como yyyy-mm-dd (columnas DATE).
export function formatDate(isoDate: string): string {
  const [yyyy, mm, dd] = isoDate.split('-')
  return `${dd}-${mm}-${yyyy}`
}

// "Hoy" se calcula siempre en hora de Chile, sin importar la zona horaria
// del dispositivo desde el que se abre la app.
export function todayISODate(): string {
  return todayFormatter.format(new Date())
}
