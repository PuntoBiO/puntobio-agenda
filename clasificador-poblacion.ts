// clasificador-poblacion.ts
// -------------------------------------------------------------------
// IDENTIFICADOR AUTOMÁTICO DE POBLACIÓN (A / B / C / D) — PuntoBiO / BiOLAB
// -------------------------------------------------------------------
// DETERMINISTA: mismas entradas => misma salida. SIN IA. 100% auditable.
// La población se decide acá (lógica pura). La IA solo interpreta DESPUÉS.
// Implementa las compuertas G0..G4 del documento de protocolos.
// version_logica = 'pob-v1'  (cambiar al modificar reglas, para trazabilidad)
// -------------------------------------------------------------------

export type Objetivo =
  | 'rendimiento'
  | 'volver_a_entrenar'
  | 'independencia_AVD'
  | 'salud_cotidiana';

export type Experiencia = 'novato' | 'intermedio' | 'avanzado';

export interface IngresoPaciente {
  edad: number;
  banderas_rojas: boolean;              // dolor agudo no estabilizado / signos médicos de alarma
  lesion_o_cirugia_reciente: boolean;
  dolor_cronico_en_readaptacion: boolean;
  alta_fisioterapia: boolean;           // ¿ya tiene alta completa de la fase clínica?
  objetivo_rendimiento_competicion: boolean;
  compite: boolean;
  sarc_f: number;                       // 0–10
  signos_fragilidad: boolean;
  objetivo: Objetivo;
  experiencia_entrenamiento?: Experiencia;
  comparten_nivel_grupo?: boolean;      // solo afecta la modalidad de A
}

export type Poblacion = 'A' | 'B' | 'C' | 'D' | 'DERIVACION_CLINICA';

export interface ResultadoClasificacion {
  poblacion: Poblacion;
  subnivel: string | null;     // 'Grado 1/2', 'Grupo 1/2', 'pendiente' o null
  modalidad: string | null;    // grupal / circuitos / individual...
  gate: string;                // G0..G4 (qué compuerta disparó)
  motivo: string;              // explicación legible para el informe
  revisar: boolean;            // caso de borde: pedir confirmación de Lu
  nota_revisar: string | null;
  version_logica: string;
}

const VERSION = 'pob-v1';

function armar(
  poblacion: Poblacion,
  gate: string,
  motivo: string,
  subnivel: string | null,
  modalidad: string | null,
  revisar: boolean,
  nota_revisar: string | null,
): ResultadoClasificacion {
  return { poblacion, gate, motivo, subnivel, modalidad, revisar, nota_revisar, version_logica: VERSION };
}

// -------------------------------------------------------------------
// FUNCIÓN PRINCIPAL — evalúa compuertas EN ORDEN. La primera que da "sí" gana.
// -------------------------------------------------------------------
export function clasificarPoblacion(p: IngresoPaciente): ResultadoClasificacion {

  // G0 — SEGURIDAD: banderas rojas => no se clasifica para entrenar
  if (p.banderas_rojas) {
    return armar(
      'DERIVACION_CLINICA', 'G0',
      'Banderas rojas: requiere evaluación clínica/médica antes de entrenar',
      null, null, false, null,
    );
  }

  // G1 — READAPTACIÓN ACTIVA (es una fase, no un perfil)
  const enReadaptacion =
    (p.lesion_o_cirugia_reciente || p.dolor_cronico_en_readaptacion) && !p.alta_fisioterapia;
  if (enReadaptacion) {
    const esAtleta = p.compite || p.objetivo_rendimiento_competicion;
    return armar(
      'B', 'G1',
      'Poslesión / poscirugía / dolor crónico en recuperación, sin alta completa',
      null, 'individual',
      esAtleta,
      esAtleta ? 'Atleta en readaptación: reclasificar a A al alta de readaptación' : null,
    );
  }

  // G2 — SARCOPENIA / ADULTO MAYOR (gatilla por screening + objetivo, NO por edad sola)
  const perfilC =
    p.edad >= 60 && (p.sarc_f >= 4 || p.signos_fragilidad || p.objetivo === 'independencia_AVD');
  if (perfilC) {
    // El Grado (1 vs 2) se confirma con resultados SarKMED (post-evaluación). Ver definirGradoC().
    return armar(
      'C', 'G2',
      'Edad ≥60 con screening/objetivo de sarcopenia o adulto mayor',
      'pendiente (Grado se define con SarKMED)', 'pendiente',
      false, null,
    );
  }

  // G3 — PERFORMANCE (amateur o profesional)
  if (p.compite || p.objetivo_rendimiento_competicion) {
    const modalidad = p.comparten_nivel_grupo ? 'grupal (nivel compartido)' : 'individual';
    const revisar = p.edad >= 60;
    return armar(
      'A', 'G3',
      'Objetivo de rendimiento / competencia (amateur o profesional)',
      null, modalidad,
      revisar,
      revisar ? 'Deportista ≥60: confirmar ausencia de sarcopenia' : null,
    );
  }

  // G4 — POR DEFECTO: Fitness & Bienestar
  let subnivel: string | null = null;
  let modalidad: string | null = 'grupal / circuitos';
  if (p.experiencia_entrenamiento === 'avanzado') {
    subnivel = 'Grupo 2';
    modalidad = 'grupal alta intensidad';
  } else if (p.experiencia_entrenamiento === 'novato' || p.experiencia_entrenamiento === 'intermedio') {
    subnivel = 'Grupo 1';
    modalidad = 'grupal / circuitos adaptados';
  }
  return armar(
    'D', 'G4',
    'Sin readaptación / sarcopenia / objetivo de rendimiento: acondicionamiento general',
    subnivel, modalidad, false, null,
  );
}

// -------------------------------------------------------------------
// SUB-NIVEL DE C — se calcula DESPUÉS de la batería SarKMED (no en el ingreso).
// Grado 2 si cae bajo cutoffs / dependiente; Grado 1 si está sobre cutoffs.
// -------------------------------------------------------------------
export interface ResultadosSarKMED {
  sarc_f: number;            // ≥4 = riesgo
  handgrip_kg: number;
  sexo: 'M' | 'F';
  gait_speed_ms: number;     // ≤0.8 = severa
  sppb: number;              // 0–12; ≤8 bajo rendimiento
  tug_s: number;             // ≥13.5 fall risk; ≥20 severa
  dependiente_avd: boolean;
}

export function definirGradoC(r: ResultadosSarKMED): 'Grado 1' | 'Grado 2' {
  const handgripBajo = (r.sexo === 'M' && r.handgrip_kg < 27) || (r.sexo === 'F' && r.handgrip_kg < 16);
  const bajoCutoffs =
    r.dependiente_avd ||
    r.gait_speed_ms <= 0.8 ||
    r.sppb <= 8 ||
    r.tug_s >= 20 ||
    (handgripBajo && r.sarc_f >= 4);
  return bajoCutoffs ? 'Grado 2' : 'Grado 1';
}
