// clasificador-poblacion.js
// IDENTIFICADOR AUTOMÁTICO DE POBLACIÓN (A/B/C/D) — PuntoBiO / BiOLAB
// Versión navegador (plana, sin TypeScript). Lógica idéntica a clasificador-poblacion.ts
// DETERMINISTA, SIN IA. Expone window.clasificarPoblacion y window.definirGradoC.
(function () {
  var VERSION = 'pob-v1';

  function armar(poblacion, gate, motivo, subnivel, modalidad, revisar, nota_revisar) {
    return {
      poblacion: poblacion, gate: gate, motivo: motivo,
      subnivel: subnivel, modalidad: modalidad,
      revisar: revisar, nota_revisar: nota_revisar, version_logica: VERSION
    };
  }

  function clasificarPoblacion(p) {
    // G0 — Seguridad
    if (p.banderas_rojas) {
      return armar('DERIVACION_CLINICA', 'G0',
        'Banderas rojas: requiere evaluación clínica/médica antes de entrenar',
        null, null, false, null);
    }
    // G1 — Readaptación activa (fase)
    var enReadaptacion = (p.lesion_o_cirugia_reciente || p.dolor_cronico_en_readaptacion) && !p.alta_fisioterapia;
    if (enReadaptacion) {
      var esAtleta = p.compite || p.objetivo_rendimiento_competicion;
      return armar('B', 'G1',
        'Poslesión / poscirugía / dolor crónico en recuperación, sin alta completa',
        null, 'individual', !!esAtleta,
        esAtleta ? 'Atleta en readaptación: reclasificar a A al alta de readaptación' : null);
    }
    // G2 — Sarcopenia / adulto mayor
    var perfilC = p.edad >= 60 && (p.sarc_f >= 4 || p.signos_fragilidad || p.objetivo === 'independencia_AVD');
    if (perfilC) {
      return armar('C', 'G2',
        'Edad ≥60 con screening/objetivo de sarcopenia o adulto mayor',
        'pendiente (Grado se define con SarKMED)', 'pendiente', false, null);
    }
    // G3 — Performance
    if (p.compite || p.objetivo_rendimiento_competicion) {
      var modalidad = p.comparten_nivel_grupo ? 'grupal (nivel compartido)' : 'individual';
      var revisar = p.edad >= 60;
      return armar('A', 'G3',
        'Objetivo de rendimiento / competencia (amateur o profesional)',
        null, modalidad, revisar,
        revisar ? 'Deportista ≥60: confirmar ausencia de sarcopenia' : null);
    }
    // G4 — Por defecto
    var subnivel = null, modalidad2 = 'grupal / circuitos';
    if (p.experiencia_entrenamiento === 'avanzado') {
      subnivel = 'Grupo 2'; modalidad2 = 'grupal alta intensidad';
    } else if (p.experiencia_entrenamiento === 'novato' || p.experiencia_entrenamiento === 'intermedio') {
      subnivel = 'Grupo 1'; modalidad2 = 'grupal / circuitos adaptados';
    }
    return armar('D', 'G4',
      'Sin readaptación / sarcopenia / objetivo de rendimiento: acondicionamiento general',
      subnivel, modalidad2, false, null);
  }

  function definirGradoC(r) {
    var handgripBajo = (r.sexo === 'M' && r.handgrip_kg < 27) || (r.sexo === 'F' && r.handgrip_kg < 16);
    var bajoCutoffs = r.dependiente_avd || r.gait_speed_ms <= 0.8 || r.sppb <= 8 ||
      r.tug_s >= 20 || (handgripBajo && r.sarc_f >= 4);
    return bajoCutoffs ? 'Grado 2' : 'Grado 1';
  }

  window.clasificarPoblacion = clasificarPoblacion;
  window.definirGradoC = definirGradoC;
})();
