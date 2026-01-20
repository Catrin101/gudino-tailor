export const TIPOS_MEDIDA = {
  TORSO: 'Torso',
  PANTALON: 'Pantalon'
}

export const CAMPOS_MEDIDAS = {
  [TIPOS_MEDIDA.TORSO]: [
    { key: 'largo_espalda', label: 'Largo Espalda', unidad: 'cm' },
    { key: 'ancho_hombro', label: 'Ancho Hombro', unidad: 'cm' },
    { key: 'largo_manga', label: 'Largo Manga', unidad: 'cm' },
    { key: 'pecho', label: 'Pecho', unidad: 'cm' },
    { key: 'estomago', label: 'Estómago', unidad: 'cm' },
    { key: 'cuello', label: 'Cuello', unidad: 'cm' },
    { key: 'largo_frente', label: 'Largo Frente', unidad: 'cm' }
  ],
  [TIPOS_MEDIDA.PANTALON]: [
    { key: 'largo_pantalon', label: 'Largo Pantalón', unidad: 'cm' },
    { key: 'tiro', label: 'Tiro', unidad: 'cm' },
    { key: 'cintura', label: 'Cintura', unidad: 'cm' },
    { key: 'cadera', label: 'Cadera', unidad: 'cm' },
    { key: 'pierna', label: 'Pierna', unidad: 'cm' },
    { key: 'rodilla', label: 'Rodilla', unidad: 'cm' },
    { key: 'pantorrilla', label: 'Pantorrilla', unidad: 'cm' },
    { key: 'campana', label: 'Campana', unidad: 'cm' }
  ]
}

export const TOLERANCIA_AJUSTE = {
  pecho: 5,
  estomago: 5,
  cintura: 5,
  cadera: 5,
  largo_manga: 3,
  largo_pantalon: 3
}
