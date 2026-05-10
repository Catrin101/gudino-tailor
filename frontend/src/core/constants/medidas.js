/**
 * Constantes de medidas para GudiñoTailor
 * Delegates to src/utils/medidas.config.js for field definitions
 */
import { CAMPOS_TORSO as _CAMPOS_TORSO, CAMPOS_PANTALON as _CAMPOS_PANTALON, TOLERANCIA_AJUSTE as _TOLERANCIA_AJUSTE } from '../../utils/medidas.config'

export const TIPOS_MEDIDA = {
  TORSO: 'Torso',
  PANTALON: 'Pantalon'
}

export const CAMPOS_TORSO = _CAMPOS_TORSO
export const CAMPOS_PANTALON = _CAMPOS_PANTALON
export const TOLERANCIA_AJUSTE = _TOLERANCIA_AJUSTE

export const CAMPOS_MEDIDAS = {
  [TIPOS_MEDIDA.TORSO]: CAMPOS_TORSO,
  [TIPOS_MEDIDA.PANTALON]: CAMPOS_PANTALON
}

export const EJEMPLO_VALORES_TORSO = Object.fromEntries(
  _CAMPOS_TORSO.map(c => [c.key, c.tipo === 'entero' ? 0 : 0.0])
)

export const EJEMPLO_VALORES_PANTALON = Object.fromEntries(
  _CAMPOS_PANTALON.map(c => [c.key, c.tipo === 'entero' ? 0 : 0.0])
)
