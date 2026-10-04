// ============================================================
// tests_biolab_comun.js — definiciones compartidas de Test BiOLAB
// Lo usan test_biolab.html (donde se toman los tests) y ficha_funcional.html
// (la ficha que se ve en la HC, en SARKMED y en Mi Espacio).
// Una sola definición: si cambia un corte o un nombre, cambia en todos lados.
// ============================================================

// Cómo se grafica y se compara cada test (qué valor, para qué lado es mejor, cortes clínicos)
export const EVO = {
  tug:        { titulo: 'Tiempo del TUG', unidad: 's', mejor: 'menos', dec: 2, val: r => +r.valor,
                bandas: [{ y: 10, txt: '10 s · normal' }, { y: 13.5, txt: '13,5 s · riesgo de caídas' }] },
  marcha4:    { titulo: 'Velocidad de marcha', unidad: 'm/s', mejor: 'mas', dec: 2,
                val: r => r.detalle && r.detalle.velocidad_ms != null ? +r.detalle.velocidad_ms : (r.valor ? 4 / r.valor : null),
                bandas: [{ y: 0.8, txt: '0,8 m/s · fragilidad' }, { y: 1.0, txt: '1,0 m/s · independencia' }] },
  step2:      { titulo: 'Pasos en 2 minutos (rodilla derecha)', unidad: 'pasos', mejor: 'mas', dec: 0, val: r => +r.valor, bandas: [] },
  rom:        { titulo: 'LSI más bajo de la planilla de ROM', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null,
                bandas: [{ y: 90, txt: '90% · simetría' }] },
  ohs:        { titulo: 'Compensaciones en la sentadilla overhead', unidad: 'compensaciones', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 8, bandas: [] },
  fsd:        { titulo: 'Forward Step Down (peor pierna)', unidad: 'puntos', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 6,
                bandas: [{ y: 1.5, txt: 'hasta 1 · buena' }, { y: 3.5, txt: '4 o más · pobre' }] },
  equilibrio: { titulo: 'Equilibrio SPPB', unidad: 'puntos', mejor: 'mas', dec: 0, val: r => +r.valor, bandas: [], min: 0, max: 4 },
}

// ROM · movilidad analítica
export const ROM = [
  { sec: 'tobillo', n: 'Tobillo y pie', items: [
    { k: 'lunge_g', n: 'Lunge test (°)', ref: { min: 40, txt: '40–45°' } },
    { k: 'lunge_cm', n: 'Lunge test (cm a la pared)', ref: { min: 10, txt: '10–12 cm' } },
    { k: 'navicular_mm', n: 'Drop navicular (mm)', menos: true, ref: { max: 10, txt: '< 10 mm · ≥ 15 anormal' } },
  ] },
  { sec: 'rodilla', n: 'Rodilla', items: [
    { k: 'rod_flex_act', n: 'Flexión activa (°)' }, { k: 'rod_flex_pas', n: 'Flexión pasiva (°)' }, { k: 'rod_ext', n: 'Extensión (°)' },
  ] },
  { sec: 'cadera', n: 'Cadera', items: [
    { k: 'cad_ri', n: 'Rotación interna (°)', ref: { min: 45, txt: '≈ 45°' } }, { k: 'cad_re', n: 'Rotación externa (°)', ref: { min: 45, txt: '≈ 45°' } },
    { k: 'cad_trom', n: 'TROM cadera (RI + RE)', calc: ['cad_ri', 'cad_re'], ref: { min: 85, txt: 'al menos 85°' } },
  ] },
  { sec: 'posterior', n: 'Cadena posterior', items: [
    { k: 'slr', n: 'Elevación de pierna recta (°)' }, { k: 'mhfket', n: 'MHFKET (°)' },
  ] },
  { sec: 'hombro', n: 'Hombro', items: [
    { k: 'hom_ri', n: 'Rotación interna (°)' }, { k: 'hom_re', n: 'Rotación externa (°)' },
    { k: 'hom_trom', n: 'TROM hombro (RI + RE)', calc: ['hom_ri', 'hom_re'] },
    { k: 'hom_elev', n: 'Elevación / flexión (°)', ref: { min: 170, txt: '170–180°' } },
  ] },
]
export const ROM_ITEMS = ROM.flatMap(g => g.items.map(i => ({ ...i, sec: g.sec })))
export const LSI_OK = 90   // % — por debajo se marca en rojo (como la planilla del curso)

// Nombres para el profesional y para el paciente (Mi Espacio), e interpretación clínica
export const INFO = {
  ohs:        { ico: '🙌', nombre: 'Sentadilla overhead', pac: 'Calidad de tu sentadilla', pacUnidad: 'ajustes a trabajar' },
  rom:        { ico: '📐', nombre: 'ROM · movilidad analítica', pac: 'Tu movilidad', pacUnidad: '' },
  fsd:        { ico: '🪜', nombre: 'Forward Step Down', pac: 'Control al bajar un escalón', pacUnidad: 'puntos (menos es mejor)' },
  tug:        { ico: '🪑', nombre: 'Timed Up & Go (TUG)', pac: 'Levantarte, caminar y volver a sentarte', pacUnidad: 'segundos' },
  marcha4:    { ico: '🚶', nombre: 'Marcha 4 metros', pac: 'Tu velocidad al caminar', pacUnidad: 'm/s' },
  step2:      { ico: '🦵', nombre: '2-Minute Step Test', pac: 'Marcha en el lugar (2 minutos)', pacUnidad: 'pasos' },
  equilibrio: { ico: '🧍', nombre: 'Equilibrio SPPB', pac: 'Tu equilibrio', pacUnidad: 'de 4 puntos' },
}
export const ORDEN = ['ohs', 'rom', 'fsd', 'equilibrio', 'tug', 'marcha4', 'step2']

// Lectura clínica (solo para el profesional; al paciente no se le muestra)
export function interpretar(test, v) {
  if (v == null || isNaN(v)) return null
  switch (test) {
    case 'tug': return v < 10 ? ['ok', 'Movilidad normal, independiente'] : v < 13.5 ? ['ok', 'Funcional, mayormente independiente'] : v < 20 ? ['warn', 'Riesgo aumentado de caídas'] : v < 30 ? ['bad', 'Movilidad reducida'] : ['bad', 'Dependencia']
    case 'marcha4': return v < 0.8 ? ['bad', 'Fragilidad o riesgo de deterioro funcional'] : v <= 1.0 ? ['warn', 'Movilidad moderada'] : ['ok', 'Adecuada para la independencia']
    case 'fsd': return v <= 1 ? ['ok', 'Buena calidad de movimiento'] : v <= 3 ? ['warn', 'Calidad moderada'] : ['bad', 'Calidad pobre']
    case 'equilibrio': return v >= 4 ? ['ok', 'Equilibrio completo'] : v >= 2 ? ['warn', 'Equilibrio parcial'] : ['bad', 'Equilibrio muy limitado']
    case 'ohs': return v === 0 ? ['ok', 'Patrón sin compensaciones'] : v <= 2 ? ['warn', v + ' compensación' + (v === 1 ? '' : 'es')] : ['bad', v + ' compensaciones']
    case 'rom': return v >= LSI_OK ? ['ok', 'Sin asimetrías relevantes'] : ['bad', 'Asimetría (LSI < ' + LSI_OK + '%)']
    default: return null
  }
}

// Normaliza un DNI a solo dígitos (así se guarda en tests_biolab.paciente_dni)
export const normDni = (d) => { const x = String(d ?? '').replace(/\D/g, ''); return x || null }
