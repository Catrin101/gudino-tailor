import { useState, useEffect, useCallback } from 'react'
import { useCitas } from '../../hooks/useCitas'

export function useCalendario() {
  const { obtenerCitasPorRango, obtenerCitasPorDia, loading } = useCitas()
  const [citas, setCitas] = useState([])
  const [fechaActual, setFechaActual] = useState(new Date())
  const [vista, setVista] = useState('semanal')

  const cargarCitas = useCallback(async () => {
    let inicio, fin

    if (vista === 'semanal') {
      const lunes = new Date(fechaActual)
      lunes.setDate(fechaActual.getDate() - ((fechaActual.getDay() + 6) % 7))
      lunes.setHours(0, 0, 0, 0)
      const domingo = new Date(lunes)
      domingo.setDate(lunes.getDate() + 6)
      domingo.setHours(23, 59, 59, 999)
      inicio = lunes.toISOString()
      fin = domingo.toISOString()
    } else {
      const dia = new Date(fechaActual)
      dia.setHours(0, 0, 0, 0)
      const finDia = new Date(fechaActual)
      finDia.setHours(23, 59, 59, 999)
      inicio = dia.toISOString()
      fin = finDia.toISOString()
    }

    const datos = await obtenerCitasPorRango(inicio, fin)
    setCitas(datos || [])
  }, [fechaActual, vista, obtenerCitasPorRango])

  useEffect(() => {
    cargarCitas()
  }, [cargarCitas])

  const irHoy = () => setFechaActual(new Date())

  const irAnterior = () => {
    const nueva = new Date(fechaActual)
    if (vista === 'semanal') {
      nueva.setDate(nueva.getDate() - 7)
    } else {
      nueva.setDate(nueva.getDate() - 1)
    }
    setFechaActual(nueva)
  }

  const irSiguiente = () => {
    const nueva = new Date(fechaActual)
    if (vista === 'semanal') {
      nueva.setDate(nueva.getDate() + 7)
    } else {
      nueva.setDate(nueva.getDate() + 1)
    }
    setFechaActual(nueva)
  }

  const toggleVista = () => {
    setVista(v => v === 'semanal' ? 'diaria' : 'semanal')
  }

  return {
    citas,
    fechaActual,
    vista,
    loading,
    setFechaActual,
    irHoy,
    irAnterior,
    irSiguiente,
    toggleVista,
    cargarCitas
  }
}
