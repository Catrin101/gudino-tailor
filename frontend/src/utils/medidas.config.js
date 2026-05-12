export const CAMPOS_TORSO = [
  { key: 'largo_espalda_chaquetilla', label: 'Largo de espalda chaquetilla', tipo: 'decimal' },
  { key: 'largo_espalda_chaquetilla_2', label: 'Largo de espalda chaquetilla 2', tipo: 'decimal' },
  { key: 'largo_espalda_camisa',      label: 'Largo de espalda camisa',      tipo: 'decimal' },
  { key: 'ancho_espalda',             label: 'Ancho de espalda',             tipo: 'decimal' },
  { key: 'largo_brazo',               label: 'Largo de brazo',               tipo: 'decimal' },
  { key: 'contorno_pecho',            label: 'Contorno de pecho',            tipo: 'decimal' },
  { key: 'contorno_estomago',         label: 'Contorno de estómago',         tipo: 'decimal' },
  { key: 'cuello',                    label: 'Cuello',                       tipo: 'decimal' },
  { key: 'largo_cuello_frente',       label: 'Largo de cuello al frente',    tipo: 'decimal' },
  { key: 'largo_cuello_frente_2',     label: 'Largo de cuello al frente 2',   tipo: 'decimal' },
  { key: 'largo_total_frente',        label: 'Largo total frente',           tipo: 'decimal' },
]

export const CAMPOS_PANTALON = [
  { key: 'largo_pantalon',    label: 'Largo de pantalón',    tipo: 'decimal' },
  { key: 'cintura',           label: 'Cintura',               tipo: 'decimal' },
  { key: 'contorno_cadera',   label: 'Contorno de cadera',    tipo: 'decimal' },
  { key: 'contorno_pierna',   label: 'Contorno de pierna',    tipo: 'decimal' },
  { key: 'contorno_rodilla',  label: 'Contorno de rodilla',   tipo: 'decimal' },
  { key: 'contorno_chamorro', label: 'Contorno de chamorro',  tipo: 'decimal' },
  { key: 'numero_calzado',    label: 'Número de calzado',     tipo: 'entero'  },
]

export function getMedidasVacias(tipo) {
  const campos = tipo === 'torso' ? CAMPOS_TORSO : CAMPOS_PANTALON
  return Object.fromEntries(
    campos.map(c => [c.key, c.tipo === 'entero' ? 0 : 0.0])
  )
}

export const TOLERANCIA_AJUSTE = {
  largo_espalda_chaquetilla: 3,
  largo_espalda_chaquetilla_2: 3,
  largo_espalda_camisa: 3,
  ancho_espalda: 2,
  largo_brazo: 3,
  contorno_pecho: 5,
  contorno_estomago: 5,
  cuello: 2,
  largo_cuello_frente: 3,
  largo_cuello_frente_2: 3,
  largo_total_frente: 3,
  largo_pantalon: 3,
  cintura: 5,
  contorno_cadera: 5,
  contorno_pierna: 3,
  contorno_rodilla: 3,
  contorno_chamorro: 3,
  numero_calzado: 2,
}
