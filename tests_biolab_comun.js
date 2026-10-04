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
  squatmono:  { titulo: 'Squat monopodal (peor lado)', unidad: 'compensaciones', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 4, bandas: [] },
  rockback:   { titulo: 'Rock back (fallas)', unidad: 'fallas', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 3, bandas: [] },
  thomas:     { titulo: 'Thomas (lados positivos)', unidad: 'lados', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 2, bandas: [] },
  hallux:     { titulo: 'Windlass (pies sin activar)', unidad: 'pies', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 2, bandas: [] },
  wallangel:  { titulo: 'Wall angel (fallas)', unidad: 'fallas', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 4, bandas: [] },
  rotoracica: { titulo: 'Rotación torácica · LSI', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 90, txt: '90% · simetría' }] },
  shouldermob:{ titulo: 'Shoulder mobility FMS (peor lado)', unidad: 'puntos', mejor: 'mas', dec: 0, val: r => r.valor != null ? +r.valor : null, min: 0, max: 3, bandas: [] },
  puente:     { titulo: 'Puente 1 pierna (lados sin control)', unidad: 'lados', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 2, bandas: [] },
  pelvico:    { titulo: 'Suelo pélvico · tareas sin síntomas', unidad: 'tareas', mejor: 'mas', dec: 0, val: r => r.valor != null ? +r.valor : null, min: 0, bandas: [] },
  antropo:    { titulo: 'Antropometría · hallazgos', unidad: 'hallazgos', mejor: 'menos', dec: 0, val: r => r.valor != null ? +r.valor : null, min: 0, bandas: [] },
  adams:      { titulo: 'Adams · ATR máximo', unidad: '°', mejor: 'menos', dec: 0, val: r => r.valor != null ? +r.valor : null, min: 0, bandas: [{ y: 5, txt: '5° · vigilar' }, { y: 7, txt: '7° · derivar' }] },
  postural:   { titulo: 'Hallazgos posturales', unidad: 'hallazgos', mejor: 'menos', dec: 0, val: r => r.valor != null ? +r.valor : null, min: 0, bandas: [] },
  unipodal:   { titulo: 'Apoyo unipodal (peor lado)', unidad: 's', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 10, txt: '10 s' }] },
  alcance:    { titulo: 'Alcance funcional', unidad: 'cm', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 15, txt: '15 cm · riesgo alto' }, { y: 25, txt: '25 cm' }] },
  seismin:    { titulo: '6 minutos de marcha', unidad: 'm', mejor: 'mas', dec: 0, val: r => r.valor != null ? +r.valor : null, bandas: [] },
  marcha4r:   { titulo: 'Marcha a paso rápido', unidad: 'm/s', mejor: 'mas', dec: 2, val: r => r.detalle && r.detalle.velocidad_ms != null ? +r.detalle.velocidad_ms : null, bandas: [] },
  sprint10:   { titulo: 'Sprint 10 m', unidad: 's', mejor: 'menos', dec: 2, val: r => r.valor != null ? +r.valor : null, bandas: [] },
  sidehop:    { titulo: 'Side hop · LSI', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 90, txt: '90% · simetría' }] },
  crossover:  { titulo: 'Crossover hop · LSI', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 90, txt: '90% · simetría' }] },
  ckcuest:    { titulo: 'CKCUEST', unidad: 'toques', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [] },
  aslr:       { titulo: 'ASLR (0 a 10)', unidad: 'puntos', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 10, bandas: [] },
  silla5:     { titulo: 'Silla 5 repeticiones', unidad: 's', mejor: 'menos', dec: 2, val: r => r.valor != null ? +r.valor : null,
                bandas: [{ y: 11.19, txt: '11,2 s · SPPB 4' }, { y: 16.7, txt: '16,7 s · SPPB 1' }] },
  silla30:    { titulo: 'Silla 30 segundos', unidad: 'repeticiones', mejor: 'mas', dec: 0, val: r => +r.valor, bandas: [] },
  pushup:     { titulo: 'Push ups', unidad: 'repeticiones', mejor: 'mas', dec: 0, val: r => +r.valor, bandas: [] },
  pullup:     { titulo: 'Pull ups', unidad: 'repeticiones', mejor: 'mas', dec: 0, val: r => +r.valor, bandas: [] },
  salto:      { titulo: 'Salto horizontal', unidad: 'cm', mejor: 'mas', dec: 0, val: r => r.valor != null ? +r.valor : null, bandas: [] },
  hop:        { titulo: 'Hop simple · LSI', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 90, txt: '90% · simetría' }] },
  triplehop:  { titulo: 'Triple hop · LSI', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 90, txt: '90% · simetría' }] },
  ybalance:   { titulo: 'Y-Balance · compuesto (peor lado)', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 94, txt: '94% · referencia' }] },
  tronco:     { titulo: 'Tronco · cocientes alterados', unidad: 'cocientes', mejor: 'menos', dec: 0, val: r => r.valor != null ? +r.valor : null, min: 0, max: 3, bandas: [] },
  sfma:       { titulo: 'SFMA · patrones no FN', unidad: 'patrones', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 4, bandas: [] },
  cva:        { titulo: 'Ángulo craneovertebral', unidad: '°', mejor: 'mas', dec: 0, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 50, txt: '50° · cabeza adelantada' }] },
  rotcerv:    { titulo: 'Rotación cervical · LSI', unidad: '%', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [{ y: 90, txt: '90% · simetría' }] },
  dnf:        { titulo: 'Flexores profundos de cuello', unidad: 's', mejor: 'mas', dec: 1, val: r => r.valor != null ? +r.valor : null, bandas: [] },
  estocada:   { titulo: 'Estocada con cambio (fallas)', unidad: 'fallas', mejor: 'menos', dec: 0, val: r => +r.valor, min: 0, max: 4, bandas: [] },
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
  ohs:        { ico: '🏋️', nombre: 'Sentadilla overhead', pac: 'Calidad de tu sentadilla', pacUnidad: 'ajustes a trabajar' },
  rom:        { ico: '📐', nombre: 'ROM · movilidad analítica', pac: 'Tu movilidad', pacUnidad: '' },
  fsd:        { ico: '🪜', nombre: 'Forward Step Down', pac: 'Control al bajar un escalón', pacUnidad: 'puntos (menos es mejor)' },
  tug:        { ico: '🪑', nombre: 'Timed Up & Go (TUG)', pac: 'Levantarte, caminar y volver a sentarte', pacUnidad: 'segundos' },
  marcha4:    { ico: '🚶', nombre: 'Marcha 4 metros', pac: 'Tu velocidad al caminar', pacUnidad: 'm/s' },
  step2:      { ico: '🦵', nombre: '2-Minute Step Test', pac: 'Marcha en el lugar (2 minutos)', pacUnidad: 'pasos' },
  equilibrio: { ico: '🧍', nombre: 'Equilibrio SPPB', pac: 'Tu equilibrio', pacUnidad: 'de 4 puntos' },
  squatmono:  { ico: '🦩', nombre: 'Squat monopodal', pac: 'Sentadilla a una pierna', pacUnidad: 'ajustes a trabajar' },
  rockback:   { ico: '🐈', nombre: 'Rock back', pac: 'Movilidad en cuadrupedia', pacUnidad: 'ajustes a trabajar' },
  thomas:     { ico: '🛏️', nombre: 'Test de Thomas', pac: 'Flexibilidad de cadera', pacUnidad: 'lados a trabajar' },
  hallux:     { ico: '🦶', nombre: 'Hallux / Jack test', pac: 'Funcionamiento del pie', pacUnidad: 'pies a trabajar' },
  wallangel:  { ico: '🧱', nombre: 'Wall angel', pac: 'Movilidad de hombros contra la pared', pacUnidad: 'ajustes a trabajar' },
  rotoracica: { ico: '🔄', nombre: 'Rotación torácica', pac: 'Rotación de tu espalda', pacUnidad: '% de simetría' },
  shouldermob:{ ico: '🤲', nombre: 'Shoulder mobility (FMS)', pac: 'Movilidad de hombros', pacUnidad: 'de 3 puntos' },
  puente:     { ico: '🌉', nombre: 'Puente glúteo 1 pierna', pac: 'Puente a una pierna', pacUnidad: 'lados a trabajar' },
  pelvico:    { ico: '🌸', nombre: 'Suelo pélvico funcional', pac: 'Tu tolerancia a la carga', pacUnidad: 'tareas sin síntomas' },
  antropo:    { ico: '📏', nombre: 'Antropometría BiOLAB', pac: 'Medidas de tus brazos y piernas', pacUnidad: 'diferencias a trabajar' },
  adams:      { ico: '🙇', nombre: 'Maniobra de Adams', pac: 'Simetría de tu espalda', pacUnidad: 'grados (menos es mejor)' },
  postural:   { ico: '🧍‍♂️', nombre: 'Análisis postural', pac: 'Tu postura', pacUnidad: 'puntos a trabajar' },
  unipodal:   { ico: '🦩', nombre: 'Apoyo unipodal', pac: 'Equilibrio en una pierna', pacUnidad: 'segundos' },
  alcance:    { ico: '🫳', nombre: 'Alcance funcional', pac: 'Cuánto llegás estirándote', pacUnidad: 'cm' },
  seismin:    { ico: '🚶‍♀️', nombre: '6 minutos de marcha', pac: 'Lo que caminás en 6 minutos', pacUnidad: 'metros' },
  marcha4r:   { ico: '🏃‍♀️', nombre: 'Marcha a paso rápido', pac: 'Tu paso rápido', pacUnidad: 'm/s' },
  sprint10:   { ico: '⚡', nombre: 'Sprint 10 m', pac: 'Tu sprint de 10 m', pacUnidad: 'segundos' },
  sidehop:    { ico: '↔️', nombre: 'Side hop test', pac: 'Saltos laterales', pacUnidad: '% de simetría' },
  crossover:  { ico: '⤴️', nombre: 'Crossover hop', pac: 'Saltos cruzados', pacUnidad: '% de simetría' },
  ckcuest:    { ico: '🤚', nombre: 'CKCUEST', pac: 'Estabilidad de brazos', pacUnidad: 'toques' },
  aslr:       { ico: '🦵', nombre: 'ASLR', pac: 'Control de pelvis al levantar la pierna', pacUnidad: 'puntos (menos es mejor)' },
  silla5:     { ico: '💺', nombre: 'Silla 5 repeticiones', pac: 'Pararte y sentarte 5 veces', pacUnidad: 'segundos (menos es mejor)' },
  silla30:    { ico: '🪑', nombre: 'Silla 30 segundos', pac: 'Veces que te parás en 30 segundos', pacUnidad: 'repeticiones' },
  pushup:     { ico: '💪', nombre: 'Push ups', pac: 'Flexiones de brazos', pacUnidad: 'repeticiones' },
  pullup:     { ico: '🧗', nombre: 'Pull ups', pac: 'Dominadas', pacUnidad: 'repeticiones' },
  salto:      { ico: '🐸', nombre: 'Salto horizontal', pac: 'Tu salto en largo', pacUnidad: 'cm' },
  hop:        { ico: '🦘', nombre: 'Hop test simple', pac: 'Salto a una pierna', pacUnidad: '% de simetría' },
  triplehop:  { ico: '🐇', nombre: 'Triple hop', pac: 'Triple salto a una pierna', pacUnidad: '% de simetría' },
  ybalance:   { ico: '⭐', nombre: 'Y-Balance', pac: 'Equilibrio en estrella', pacUnidad: '%' },
  tronco:     { ico: '🧱', nombre: 'Resistencia de tronco (McGill)', pac: 'Resistencia de tu tronco', pacUnidad: 'ajustes a trabajar' },
  sfma:       { ico: '🧘', nombre: 'Patrones SFMA', pac: 'Movimientos globales', pacUnidad: 'patrones a trabajar' },
  cva:        { ico: '🗿', nombre: 'Ángulo craneovertebral', pac: 'Postura de tu cabeza', pacUnidad: 'grados (más es mejor)' },
  rotcerv:    { ico: '↔️', nombre: 'Rotación cervical', pac: 'Giro de tu cuello', pacUnidad: '% de simetría' },
  dnf:        { ico: '⏱️', nombre: 'Flexores profundos de cuello', pac: 'Resistencia de tu cuello', pacUnidad: 'segundos' },
  estocada:   { ico: '🤺', nombre: 'Estocada con cambio', pac: 'Estocadas', pacUnidad: 'ajustes a trabajar' },
}
export const ORDEN = ['pelvico', 'postural', 'adams', 'antropo', 'ohs', 'rockback', 'rom', 'thomas', 'hallux', 'rotoracica', 'wallangel', 'shouldermob', 'squatmono', 'fsd', 'puente', 'estocada', 'cva', 'rotcerv', 'dnf', 'sfma', 'tronco', 'ybalance', 'salto', 'hop', 'triplehop', 'pushup', 'pullup', 'sidehop', 'crossover', 'sprint10', 'ckcuest', 'aslr', 'equilibrio', 'unipodal', 'alcance', 'silla5', 'silla30', 'tug', 'marcha4', 'marcha4r', 'step2', 'seismin']

// Lectura clínica (solo para el profesional; al paciente no se le muestra)
export function interpretar(test, v) {
  if (v == null || isNaN(v)) return null
  switch (test) {
    case 'tug': return v < 10 ? ['ok', 'Movilidad normal, independiente'] : v < 13.5 ? ['ok', 'Funcional, mayormente independiente'] : v < 20 ? ['warn', 'Riesgo aumentado de caídas'] : v < 30 ? ['bad', 'Movilidad reducida'] : ['bad', 'Dependencia']
    case 'marcha4': return v < 0.8 ? ['bad', 'Fragilidad o riesgo de deterioro funcional'] : v <= 1.0 ? ['warn', 'Movilidad moderada'] : ['ok', 'Adecuada para la independencia']
    case 'fsd': return v <= 1 ? ['ok', 'Buena calidad de movimiento'] : v <= 3 ? ['warn', 'Calidad moderada'] : ['bad', 'Calidad pobre']
    case 'equilibrio': return v >= 4 ? ['ok', 'Equilibrio completo'] : v >= 2 ? ['warn', 'Equilibrio parcial'] : ['bad', 'Equilibrio muy limitado']
    case 'ohs': return v === 0 ? ['ok', 'Patrón sin compensaciones'] : v <= 2 ? ['warn', v + ' compensación' + (v === 1 ? '' : 'es')] : ['bad', v + ' compensaciones']
    case 'unipodal': return v < 10 ? ['warn', 'Menos de 10 s'] : ['ok', 'Equilibrio adecuado']
    case 'alcance': return v < 15 ? ['bad', 'Riesgo alto de caídas (orientativo)'] : v < 25 ? ['warn', 'Riesgo moderado (orientativo)'] : ['ok', 'Alcance adecuado']
    case 'sidehop': case 'crossover': return v >= LSI_OK ? ['ok', 'Simétrico'] : ['bad', 'Asimetría']
    case 'aslr': return v === 0 ? ['ok', 'Sin dificultad'] : v <= 2 ? ['warn', `${v}/10`] : ['bad', `${v}/10`]
    case 'antropo': return v === 0 ? ['ok', 'Simétrico'] : ['warn', v + ' hallazgo' + (v === 1 ? '' : 's')]
    case 'adams': return v >= 7 ? ['bad', 'Derivar para radiografía'] : v >= 5 ? ['warn', 'Vigilar'] : ['ok', 'Dentro de lo esperable']
    case 'postural': return v === 0 ? ['ok', 'Sin desvíos relevantes'] : ['warn', v + ' hallazgo' + (v === 1 ? '' : 's')]
    case 'silla5': return v <= 11.19 ? ['ok', 'SPPB silla 4/4'] : v <= 13.69 ? ['ok', 'SPPB silla 3/4'] : v <= 16.69 ? ['warn', 'SPPB silla 2/4'] : ['bad', 'SPPB silla 1/4']
    case 'hop': case 'triplehop': return v >= LSI_OK ? ['ok', 'Simétrico'] : ['bad', 'Asimetría de salto']
    case 'ybalance': return v >= 94 ? ['ok', 'Compuesto en rango'] : ['warn', 'Compuesto bajo']
    case 'tronco': case 'sfma': return v === 0 ? ['ok', 'Sin hallazgos'] : ['warn', v + ' hallazgo' + (v === 1 ? '' : 's')]
    case 'cva': return v < 50 ? ['warn', 'Cabeza adelantada'] : ['ok', 'Postura de cabeza adecuada']
    case 'dnf': return v < 20 ? ['warn', 'Resistencia baja'] : v < 30 ? ['warn', 'Resistencia moderada'] : ['ok', 'Buena resistencia']
    case 'rom': case 'rotoracica': case 'rotcerv': return v >= LSI_OK ? ['ok', 'Sin asimetrías relevantes'] : ['bad', 'Asimetría (LSI < ' + LSI_OK + '%)']
    case 'shouldermob': return v === 3 ? ['ok', 'Movilidad completa'] : v === 2 ? ['warn', 'Movilidad aceptable'] : v === 0 ? ['bad', 'Dolor en el despeje'] : ['bad', 'Movilidad limitada']
    case 'squatmono': case 'rockback': case 'thomas': case 'hallux': case 'wallangel': case 'puente': case 'estocada':
      return v === 0 ? ['ok', 'Sin hallazgos'] : ['warn', v + ' hallazgo' + (v === 1 ? '' : 's')]
    default: return null
  }
}

// Normaliza un DNI a solo dígitos (así se guarda en tests_biolab.paciente_dni)
export const normDni = (d) => { const x = String(d ?? '').replace(/\D/g, ''); return x || null }

// ============================================================
// SUELO PÉLVICO: definiciones del protocolo (las usan Test BiOLAB, la ficha y la HC de SARKMED)
// ============================================================
export const PEL_ANAM = [
  { sec: 'Contexto', campos: [
    { k: 'sexo', n: 'Sexo', t: 'ops', ops: ['Mujer', 'Hombre'], def: 'Mujer' },
    { k: 'etapa', n: 'Etapa', t: 'ops', ops: ['—', 'Embarazo', 'Posparto (menos de 1 año)', 'Perimenopausia / menopausia', 'Ninguna en particular'], si: c => c.sexo === 'Mujer' },
    { k: 'motivo', n: 'Motivo de consulta', t: 'txt' } ] },
  { sec: 'Antecedentes gineco-obstétricos', si: c => c.sexo === 'Mujer', campos: [
    { k: 'gestas', n: 'Embarazos', t: 'num' }, { k: 'partos_vag', n: 'Partos vaginales', t: 'num' }, { k: 'cesareas', n: 'Cesáreas', t: 'num' },
    { k: 'instrumental', n: 'Parto instrumental (fórceps / ventosa)', t: 'sino' }, { k: 'desgarro', n: 'Desgarro o episiotomía', t: 'ops', ops: ['—', 'No', 'Episiotomía', 'Desgarro grado 1–2', 'Desgarro grado 3–4'] },
    { k: 'peso_bebe', n: 'Bebé de más de 4 kg', t: 'sino' }, { k: 'ultimo_parto', n: 'Fecha del último parto', t: 'txt' },
    { k: 'lactancia', n: 'Lactancia actual', t: 'sino', si: c => c.etapa.startsWith('Posparto') },
    { k: 'semanas', n: 'Semanas de embarazo', t: 'num', si: c => c.etapa === 'Embarazo' },
    { k: 'thr', n: 'Terapia hormonal', t: 'sino', si: c => c.etapa.startsWith('Perimeno') },
    { k: 'sequedad', n: 'Sequedad / síntomas genitourinarios', t: 'sino', si: c => c.etapa.startsWith('Perimeno') || (c.edad || 0) >= 45 } ] },
  { sec: 'Antecedentes urológicos y quirúrgicos', campos: [
    { k: 'prostatectomia', n: 'Prostatectomía u otra cirugía de próstata', t: 'sino', si: c => c.sexo === 'Hombre' },
    { k: 'cirugias', n: 'Cirugías pélvicas o abdominales', t: 'txt' }, { k: 'itu', n: 'Infecciones urinarias recurrentes', t: 'sino' } ] },
  { sec: 'Síntomas', campos: [
    { k: 'iu_esfuerzo', n: 'Escape de orina al toser, estornudar, saltar o hacer fuerza', t: 'sino' },
    { k: 'iu_urgencia', n: 'Escape con urgencia (no llega al baño)', t: 'sino' }, { k: 'urgencia', n: 'Urgencia miccional', t: 'sino' },
    { k: 'frecuencia', n: 'Veces que orina de día', t: 'num' }, { k: 'nocturia', n: 'Veces que se levanta a orinar de noche', t: 'num' },
    { k: 'vaciado', n: 'Sensación de vaciado incompleto / chorro débil', t: 'sino' },
    { k: 'if_heces', n: 'Escape de heces', t: 'sino' }, { k: 'if_gases', n: 'Escape de gases', t: 'sino' },
    { k: 'bulto', n: 'Sensación de peso o bulto', t: 'sino' }, { k: 'dolor_pel', n: 'Dolor pélvico', t: 'sino' },
    { k: 'dispareunia', n: 'Dolor en las relaciones', t: 'sino' },
    { k: 'caida_urg', n: 'Se apura o se cayó yendo al baño', t: 'sino', si: c => (c.edad || 0) >= 65 } ] },
  { sec: 'Intestino y hábitos', campos: [
    { k: 'constipacion', n: 'Constipación / esfuerzo al evacuar', t: 'sino' }, { k: 'bristol', n: 'Escala de Bristol habitual', t: 'ops', ops: ['—', '1', '2', '3', '4', '5', '6', '7'] },
    { k: 'liquidos', n: 'Litros de líquido por día', t: 'num' }, { k: 'cafeina', n: 'Tazas de café o mate por día', t: 'num' },
    { k: 'deporte', n: 'Deporte o entrenamiento', t: 'txt' }, { k: 'impacto', n: 'Hace deporte de impacto o fuerza', t: 'sino' },
    { k: 'perdida_entreno', n: 'Pierde al entrenar (saltos, soga, carrera, cargas)', t: 'sino', si: c => c.perfil !== 'sedentario' },
    { k: 'quiere_correr', n: 'Quiere volver a correr / al impacto', t: 'sino', si: c => c.etapa.startsWith('Posparto') } ] },
  { sec: 'Banderas de derivación', campos: [
    { k: 'rf_sangre', n: 'Sangre en la orina', t: 'sino' }, { k: 'rf_retencion', n: 'No puede orinar / retención', t: 'sino' },
    { k: 'rf_dolor', n: 'Dolor intenso o que no cede', t: 'sino' }, { k: 'rf_neuro', n: 'Adormecimiento en la zona genital / perineal o de piernas', t: 'sino' },
    { k: 'rf_bulto', n: 'Bulto visible fuera de la vagina', t: 'sino', si: c => c.sexo === 'Mujer' } ] },
]
// ICIQ-SF (puntaje 0 a 21) · Sandvik (frecuencia × cantidad) · pad test
export const ICIQ_FREC = [['Nunca', 0], ['Una vez por semana o menos', 1], ['2 o 3 veces por semana', 2], ['Una vez al día', 3], ['Varias veces al día', 4], ['Continuamente', 5]]
export const ICIQ_CANT = [['Nada', 0], ['Muy poca cantidad', 2], ['Cantidad moderada', 4], ['Mucha cantidad', 6]]
export const ICIQ_CUANDO = ['Nunca', 'Antes de llegar al baño', 'Al toser o estornudar', 'Mientras duerme', 'Al hacer actividad física / ejercicio', 'Al terminar de orinar y vestirse', 'Sin motivo evidente', 'De forma continua']
export const SANDVIK_F = [['—', 0], ['Menos de una vez al mes', 1], ['Algunas veces al mes', 2], ['Algunas veces por semana', 3], ['Todos los días y/o noches', 4]]
export const SANDVIK_C = [['—', 0], ['Gotas', 1], ['Pequeñas cantidades', 2], ['Más', 3]]
// Batería de provocación: de menos a más presión. nivel = exigencia (se filtra por el perfil del paciente)
export const PEL_TAREAS = [
  { k: 'tos', n: 'Tos fuerte ×3, de pie', nivel: 1 }, { k: 'silla', n: 'Pararse de la silla ×5', nivel: 1 },
  { k: 'levantar', n: 'Levantar 5 kg del piso', nivel: 1 }, { k: 'caminar', n: 'Caminar rápido 1 min', nivel: 1 }, { k: 'escalon', n: 'Subir y bajar un escalón ×10', nivel: 1 },
  { k: 'cuadriceps', n: 'Extensión de rodilla isométrica máxima, sentada (DynaMo)', nivel: 2 }, { k: 'overhead', n: 'Sostener carga por encima de la cabeza 20 s', nivel: 2 },
  { k: 'sentadilla', n: 'Sentadilla con carga ×10', nivel: 2 }, { k: 'plancha', n: 'Plancha frontal (hasta 30 s)', nivel: 2 },
  { k: 'imtp', n: 'Tirón de medio muslo máximo (IMTP · ForceDecks)', nivel: 3 }, { k: 'trote', n: 'Trote en el lugar 1 min', nivel: 3 },
  { k: 'saltos', n: 'Saltos en el lugar ×10', nivel: 3 }, { k: 'saltos1', n: 'Saltos a una pierna ×10 por lado', nivel: 3 },
  { k: 'jacks', n: 'Jumping jacks 1 min', nivel: 3 }, { k: 'soga', n: 'Soga / doble salto 30 s', nivel: 3 },
]


// Protocolo completo en solo lectura (para la HC de SARKMED y la ficha). Recibe el detalle guardado de la toma.
export function htmlProtocoloPelvico(v, fecha) {
  if (!v) return ''
  const e = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const vacio = (x) => x == null || x === '' || x === '—'
  const ctx = { sexo: v.sexo || 'Mujer', etapa: v.etapa || '—', edad: null, perfil: null }
  const filas = (pares) => pares.filter(([, x]) => !vacio(x)).map(([n, x]) => `<tr><td style="padding:4px 8px;color:#475569">${e(n)}</td><td style="padding:4px 8px;font-weight:600">${e(x)}</td></tr>`).join('')
  const bloque = (tit, cuerpo) => cuerpo ? `<div style="margin:10px 0"><div style="font-weight:800;font-size:13px;color:#0c7bb8;margin-bottom:4px">${e(tit)}</div><table style="width:100%;border-collapse:collapse;font-size:13px">${cuerpo}</table></div>` : ''
  let h = ''
  PEL_ANAM.forEach(sx => { const cs = sx.campos.filter(f => !f.si || (() => { try { return f.si({ ...ctx, etapa: ctx.etapa, edad: 99, perfil: 'activo' }) } catch (er) { return true } })())
    h += bloque(sx.sec, filas(cs.map(f => [f.n, v[f.k]]))) })
  const r = v.resultados || {}
  h += bloque('Cuestionarios', filas([['ICIQ-SF', r.iciq != null ? `${r.iciq}/21 (${r.iciq_grado})` : null], ['Cuándo pierde', (v.iciq_cuando || []).join(', ')],
    ['Sandvik', r.sandvik != null ? `${r.sandvik} (${r.sandvik_grado})` : null], ['Pad test 1 h', v.pad_g != null ? `${v.pad_g} g (${r.pad})` : null]]))
  h += bloque('Diástasis y respiración', filas([['Arriba del ombligo (reposo / curl-up)', vacio(v.dr_sup_r) && vacio(v.dr_sup_c) ? null : `${v.dr_sup_r ?? '—'} / ${v.dr_sup_c ?? '—'}`],
    ['Ombligo (reposo / curl-up)', vacio(v.dr_umb_r) && vacio(v.dr_umb_c) ? null : `${v.dr_umb_r ?? '—'} / ${v.dr_umb_c ?? '—'}`],
    ['Abajo del ombligo (reposo / curl-up)', vacio(v.dr_inf_r) && vacio(v.dr_inf_c) ? null : `${v.dr_inf_r ?? '—'} / ${v.dr_inf_c ?? '—'}`],
    ['Abombamiento', v.doming], ['Patrón respiratorio', v.respiracion]]))
  const post = []
  if (v.postura_ht) Object.entries(v.postura_ht).forEach(([k, x]) => post.push([`HumanTrak · ${k.replace(/_/g, ' ')}`, typeof x === 'object' ? `${x.cm ?? ''} cm ${x.lado_descendido ? '(baja ' + x.lado_descendido + ')' : ''}` : x]))
  if (v.postura) Object.entries(v.postura).forEach(([k, x]) => post.push([`Foto · ${k.replace(/_/g, ' ')}`, x]))
  h += bloque('Postura', filas(post))
  const tareas = PEL_TAREAS.filter(t => v.tareas && v.tareas[t.k]).map(t => { const x = v.tareas[t.k]
    return [t.n, [x.esc && x.esc !== '—' ? 'escape ' + x.esc.toLowerCase() : '', x.pes === 'SI' ? 'pesadez' : '', x.dol === 'SI' ? 'dolor' : '', x.est && !['—', 'Normal'].includes(x.est) ? x.est.toLowerCase() : ''].filter(Boolean).join(' · ') || 'sin síntomas'] })
  h += bloque('Batería de provocación', filas(tareas))
  h += bloque('Tacto (especialista)', filas([['Inspección', v.inspeccion], ['Tono en reposo', v.tono], ['Dolor a la palpación', v.palp_dolor], ['Oxford', v.oxford], ['PERFECT', r.perfect],
    ['POP-Q anterior', v.popq_a], ['POP-Q apical', v.popq_ap], ['POP-Q posterior', v.popq_p], ['Observaciones', v.esp_obs]]))
  const hall = v.hallazgos_txt || []
  return `<div style="font-family:inherit">${fecha ? `<div style="color:#64748b;font-size:12.5px">Protocolo del ${e(new Date(fecha).toLocaleDateString('es-AR'))}</div>` : ''}
    ${(v.banderas || []).length ? `<div style="background:#fee2e2;color:#7f1d1d;border-radius:8px;padding:8px 10px;margin:8px 0;font-weight:700">Banderas de derivación: ${e(v.banderas.join(', '))}</div>` : ''}
    ${hall.length ? `<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 12px;margin:8px 0;font-size:13.5px;line-height:1.5"><b>Resumen</b><br>${hall.map(e).join('<br>')}</div>` : ''}
    ${h}${v.obs ? `<div style="font-size:13px"><b>Observaciones:</b> ${e(v.obs)}</div>` : ''}</div>`
}
