/**
 * Constantes de medidas para GudiñoTailor
 * CAMBIO: Torso ahora tiene 3 medidas de espalda y 2 de pecho (total: 10 campos)
 */

// ─── TIPOS DE MEDIDA ───────────────────────────────────────────────────────
export const TIPOS_MEDIDA = {
  TORSO: 'Torso',
  PANTALON: 'Pantalon'
}

/**
 * Campos de medidas de TORSO
 * CAMBIO:
 *   - Espalda: ahora 3 campos (Alta, Media, Baja) en lugar de 1 (Largo Espalda)
 *   - Pecho:   ahora 2 campos (Alto, Bajo) en lugar de 1 (Pecho)
 * Total: 10 campos (antes 7)
 */
export const CAMPOS_TORSO = [
  // ── Espalda (3 medidas) ───────────────────────────────────────────────
  {
    key: 'espalda_alta', label: 'Espalda Alta', unidad: 'cm',
    descripcion: 'Del cuello a la línea de los hombros'
  },
  {
    key: 'espalda_media', label: 'Espalda Media', unidad: 'cm',
    descripcion: 'Del cuello a la línea de los omóplatos'
  },
  {
    key: 'espalda_baja', label: 'Espalda Baja', unidad: 'cm',
    descripcion: 'Del cuello a la cintura por la espalda'
  },

  // ── Hombros ───────────────────────────────────────────────────────────
  {
    key: 'ancho_hombro', label: 'Ancho de Hombro', unidad: 'cm',
    descripcion: 'De hombro a hombro por la espalda'
  },

  // ── Manga ─────────────────────────────────────────────────────────────
  {
    key: 'largo_manga', label: 'Largo de Manga', unidad: 'cm',
    descripcion: 'Del hombro a la muñeca'
  },

  // ── Pecho (2 medidas) ─────────────────────────────────────────────────
  {
    key: 'pecho_alto', label: 'Pecho Alto', unidad: 'cm',
    descripcion: 'Contorno de pecho a la altura de las axilas'
  },
  {
    key: 'pecho_bajo', label: 'Pecho Bajo', unidad: 'cm',
    descripcion: 'Contorno de pecho a la altura más pronunciada'
  },

  // ── Resto del torso ───────────────────────────────────────────────────
  {
    key: 'estomago', label: 'Estómago', unidad: 'cm',
    descripcion: 'Contorno de estómago (zona media)'
  },
  {
    key: 'cuello', label: 'Cuello', unidad: 'cm',
    descripcion: 'Contorno del cuello'
  },
  {
    key: 'largo_frente', label: 'Largo Frente', unidad: 'cm',
    descripcion: 'Del cuello a la cintura por el frente'
  }
]

/**
 * Campos de medidas de PANTALÓN
 * Sin cambios respecto a la versión anterior
 */
export const CAMPOS_PANTALON = [
  {
    key: 'largo_pantalon', label: 'Largo Pantalón', unidad: 'cm',
    descripcion: 'De la cintura al piso'
  },
  {
    key: 'tiro', label: 'Tiro', unidad: 'cm',
    descripcion: 'De la cintura a la entrepierna'
  },
  {
    key: 'cintura', label: 'Cintura', unidad: 'cm',
    descripcion: 'Contorno de cintura'
  },
  {
    key: 'cadera', label: 'Cadera', unidad: 'cm',
    descripcion: 'Contorno de cadera más ancha'
  },
  {
    key: 'pierna', label: 'Pierna', unidad: 'cm',
    descripcion: 'Largo de la pierna interior'
  },
  {
    key: 'rodilla', label: 'Rodilla', unidad: 'cm',
    descripcion: 'Contorno de rodilla'
  },
  {
    key: 'pantorrilla', label: 'Pantorrilla', unidad: 'cm',
    descripcion: 'Contorno de pantorrilla'
  },
  {
    key: 'campana', label: 'Campana', unidad: 'cm',
    descripcion: 'Ancho del ruedo (bocamanga del pantalón)'
  }
]

/**
 * Mapa principal de campos por tipo de medida
 * Usado por FormularioMedidas y otros componentes
 */
export const CAMPOS_MEDIDAS = {
  [TIPOS_MEDIDA.TORSO]: CAMPOS_TORSO,
  [TIPOS_MEDIDA.PANTALON]: CAMPOS_PANTALON
}

/**
 * Tolerancias de cambio para detección de diferencias extremas (en cm)
 * Si la diferencia entre medida anterior y nueva supera este valor,
 * el sistema muestra una alerta al usuario.
 *
 * CAMBIO: Se agregan tolerancias para los nuevos campos de torso
 */
export const TOLERANCIA_AJUSTE = {
  // ── Torso ─────────────────────────────────────────────────────────────
  espalda_alta: 3,   // Cambio extremo si difiere más de 3 cm
  espalda_media: 3,
  espalda_baja: 3,
  ancho_hombro: 2,
  largo_manga: 3,
  pecho_alto: 5,   // Cambio extremo si difiere más de 5 cm
  pecho_bajo: 5,
  estomago: 5,
  cuello: 2,
  largo_frente: 3,

  // ── Pantalón ──────────────────────────────────────────────────────────
  largo_pantalon: 3,
  tiro: 2,
  cintura: 5,
  cadera: 5,
  pierna: 3,
  rodilla: 3,
  pantorrilla: 3,
  campana: 2
}

/**
 * Valores de ejemplo JSON para documentación y seeds
 * Refleja la nueva estructura de Torso con 10 campos
 */
export const EJEMPLO_VALORES_TORSO = {
  espalda_alta: 42.0,
  espalda_media: 38.0,
  espalda_baja: 45.5,
  ancho_hombro: 40.0,
  largo_manga: 60.0,
  pecho_alto: 92.0,
  pecho_bajo: 95.0,
  estomago: 90.0,
  cuello: 38.0,
  largo_frente: 50.0
}

export const EJEMPLO_VALORES_PANTALON = {
  largo_pantalon: 100.0,
  tiro: 25.0,
  cintura: 85.0,
  cadera: 90.0,
  pierna: 55.0,
  rodilla: 40.0,
  pantorrilla: 35.0,
  campana: 20.0
}
