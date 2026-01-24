import { useState } from 'react'
import { Input } from '../../../../shared/components/Input'
import { Button } from '../../../../shared/components/Button'
import { Plus, X, Package, Calendar, Users } from 'lucide-react'
import { TIPOS_SERVICIO } from '../../../../core/constants/estados'

/**
 * Paso 4: Detalles del pedido
 */
export function Paso4Detalles({
  tipoServicio,
  prendas,
  nombreGrupo,
  notas,
  fechaPromesa,
  medidasTorso,
  medidasPantalon,
  onActualizar
}) {
  const [nuevaPrenda, setNuevaPrenda] = useState({
    tipo: '',
    descripcion: '',
    id_medida: null
  })

  const tiposPrenda = [
    'Saco',
    'Pantalón',
    'Camisa',
    'Chaleco',
    'Vestido',
    'Traje Completo',
    'Otro'
  ]

  const agregarPrenda = () => {
    if (!nuevaPrenda.tipo) {
      alert('Selecciona el tipo de prenda')
      return
    }

    // Para confección, asignar medida automáticamente
    let idMedida = nuevaPrenda.id_medida

    if (tipoServicio === TIPOS_SERVICIO.CONFECCION) {
      if (nuevaPrenda.tipo === 'Saco' || nuevaPrenda.tipo === 'Camisa' || nuevaPrenda.tipo === 'Chaleco') {
        idMedida = medidasTorso?.id_medida
      } else if (nuevaPrenda.tipo === 'Pantalón') {
        idMedida = medidasPantalon?.id_medida
      } else if (nuevaPrenda.tipo === 'Traje Completo') {
        // Usar ambas medidas (crearemos múltiples detalles)
        const detalles = []
        if (medidasTorso) {
          detalles.push({
            tipo: 'Saco',
            descripcion: nuevaPrenda.descripcion,
            id_medida: medidasTorso.id_medida
          })
        }
        if (medidasPantalon) {
          detalles.push({
            tipo: 'Pantalón',
            descripcion: nuevaPrenda.descripcion,
            id_medida: medidasPantalon.id_medida
          })
        }
        onActualizar({ prendas: [...prendas, ...detalles] })
        setNuevaPrenda({ tipo: '', descripcion: '', id_medida: null })
        return
      }
    }

    const prenda = {
      tipo: nuevaPrenda.tipo,
      descripcion: nuevaPrenda.descripcion,
      id_medida: idMedida
    }

    onActualizar({ prendas: [...prendas, prenda] })
    setNuevaPrenda({ tipo: '', descripcion: '', id_medida: null })
  }

  const eliminarPrenda = (index) => {
    onActualizar({ prendas: prendas.filter((_, i) => i !== index) })
  }

  const calcularFechaSugerida = () => {
    const hoy = new Date()
    
    if (tipoServicio === TIPOS_SERVICIO.CONFECCION) {
      hoy.setDate(hoy.getDate() + 14) // 2 semanas
    } else if (tipoServicio === TIPOS_SERVICIO.REMIENDO) {
      hoy.setDate(hoy.getDate() + 3) // 3 días
    } else if (tipoServicio === TIPOS_SERVICIO.RENTA) {
      hoy.setDate(hoy.getDate() + 7) // 1 semana
    }

    return hoy.toISOString().split('T')[0]
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Detalles del Pedido</h2>
      <p className="text-gray-600 mb-6">
        Especifica las prendas y configuración del pedido
      </p>

      <div className="space-y-6">
        {/* Selector de prendas (solo para Confección y Renta) */}
        {(tipoServicio === TIPOS_SERVICIO.CONFECCION || tipoServicio === TIPOS_SERVICIO.RENTA) && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Prendas a Elaborar</h3>
            </div>

            {/* Formulario para agregar prenda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Prenda
                </label>
                <select
                  value={nuevaPrenda.tipo}
                  onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, tipo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {tiposPrenda.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción / Notas
                </label>
                <input
                  type="text"
                  value={nuevaPrenda.descripcion}
                  onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, descripcion: e.target.value })}
                  placeholder="Ej: Tela azul marino, botones dorados..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={agregarPrenda}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Prenda
            </Button>

            {/* Lista de prendas agregadas */}
            {prendas.length > 0 && (
              <div className="mt-4 space-y-2">
                {prendas.map((prenda, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{prenda.tipo}</p>
                      {prenda.descripcion && (
                        <p className="text-sm text-gray-600">{prenda.descripcion}</p>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarPrenda(index)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nombre de grupo (opcional) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Nombre de Grupo (Opcional)
            </label>
          </div>
          <Input
            value={nombreGrupo}
            onChange={(e) => onActualizar({ nombre_grupo: e.target.value })}
            placeholder="Ej: Mariachi Vargas, Boda García, etc."
          />
          <p className="text-sm text-gray-500 mt-1">
            Útil para agrupar pedidos de eventos masivos
          </p>
        </div>

        {/* Fecha promesa */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Fecha de Entrega Prometida
              <span className="text-danger-500 ml-1">*</span>
            </label>
          </div>
          <input
            type="date"
            value={fechaPromesa}
            onChange={(e) => onActualizar({ fecha_promesa: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {!fechaPromesa && (
            <button
              onClick={() => onActualizar({ fecha_promesa: calcularFechaSugerida() })}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Usar fecha sugerida ({calcularFechaSugerida()})
            </button>
          )}
        </div>

        {/* Notas adicionales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={notas}
            onChange={(e) => onActualizar({ notas: e.target.value })}
            placeholder="Información adicional sobre el pedido..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
