/* ============================================================================
 * bloqueos.js · PuntoBiO
 * Módulo central de Bloqueos de Agenda.
 *
 * Lo usa cada agenda (TF, Consultorios, BioLab, Masoterapia) y mi_espacio.html
 * para chequear si un slot está bloqueado por la admin (Gestión de Cupo).
 *
 * USO MÍNIMO en una agenda:
 *
 *   <script src="bloqueos.js"></script>
 *
 *   // al arrancar la app
 *   await Bloqueos.cargar();
 *
 *   // dentro de cada slot del render, después de pintar:
 *   const b = Bloqueos.queAplica('CONSULTORIOS', '2026-05-30', '14:00', '14:30',
 *                                'brunitovelez99@gmail.com', 'FISIO');
 *   if (b) marcarSlotComoBloqueado(slot, b.motivo);
 *
 *   // antes de guardar un turno:
 *   if (await Bloqueos.bloquearOk('CONSULTORIOS', fecha, hora, hora_fin, profeEmail, practica)) return;
 *
 *   // suscripción realtime opcional (refresca solo cuando otra pestaña edita):
 *   Bloqueos.escucharCambios(() => { renderAgenda(); });
 *
 * ============================================================================ */

(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Estado interno
  // ---------------------------------------------------------------------------
  let _bloqueos = [];          // lista cacheada de bloqueos activos
  let _supabaseClient = null;  // referencia al cliente Supabase (lo detecta solo)
  let _suscripcion = null;     // canal realtime
  let _callbacksCambio = [];   // funciones a llamar cuando hay cambios

  // ---------------------------------------------------------------------------
  // Detección del cliente Supabase
  // Cada agenda crea su propio `sb` (createClient). Lo buscamos por convención.
  // ---------------------------------------------------------------------------
  function obtenerCliente() {
    if (_supabaseClient) return _supabaseClient;
    // Las agendas suelen tener una variable global `sb`. Si no, tratamos `supabase`.
    if (typeof window.sb !== 'undefined' && window.sb?.from) {
      _supabaseClient = window.sb;
    } else if (typeof window.supabase !== 'undefined' && window.supabase?.createClient) {
      // Si solo está el constructor cargado, hay que pasarle setCliente explícito.
      console.warn('[Bloqueos] No encontré `window.sb`. Usá Bloqueos.setCliente(sb) antes de cargar().');
    }
    return _supabaseClient;
  }

  // ---------------------------------------------------------------------------
  // Mapa nombre corto → email canónico
  // Las agendas viejas usan strings tipo 'BRUNO', 'MALE', 'LU', etc.
  // Los bloqueos en la base guardan emails. Este mapa los traduce
  // automáticamente. Extensible si suma alguien nuevo.
  // ---------------------------------------------------------------------------
  const MAPA_PROFES_EMAIL = {
    BRUNO: 'brunitovelez99@gmail.com',
    MALE:  'loz.magdalena@gmail.com',
    LU:    'liclucianavelaz@gmail.com',
    JIME:  'jimenahllorente@gmail.com',
    VERO:  'veronicasandler@hotmail.com',
  };

  function aEmail(idProfe) {
    if (!idProfe) return null;
    const s = String(idProfe).trim();
    if (s.includes('@')) return s.toLowerCase();
    return MAPA_PROFES_EMAIL[s.toUpperCase()] || s;
  }

  // ---------------------------------------------------------------------------
  // Helpers internos
  // ---------------------------------------------------------------------------
  function hMin(h) {
    if (!h) return null;
    const partes = h.split(':').map(Number);
    return partes[0] * 60 + (partes[1] || 0);
  }

  function hayOverlap(slotIni, slotFin, bloqIni, bloqFin) {
    // bloqIni/bloqFin null = todo el día → siempre solapa
    if (bloqIni == null && bloqFin == null) return true;
    // Si la consulta no trae hora, basta con que el día esté bloqueado
    if (slotIni == null) return true;
    const sI = hMin(slotIni);
    const sF = slotFin ? hMin(slotFin) : sI + 1;  // si no hay fin, asumimos slot puntual
    const bI = hMin(bloqIni);
    const bF = hMin(bloqFin);
    return sI < bF && sF > bI;
  }

  function aplicaABloque(b, area, fecha, horaIni, horaFin, profeEmail, practica) {
    if (!b.activo) return false;
    // area
    if (b.area !== 'TRANSVERSAL' && b.area !== area) return false;
    // fechas / recurrencia
    if (b.recurrente) {
      // Permanente (todas las semanas): aplica en ese día de semana, desde fecha_desde en adelante.
      if (b.fecha_desde && fecha < b.fecha_desde) return false;
      if (b.dia_semana != null) {
        var dow = new Date(fecha + 'T00:00:00').getDay(); // 0=Dom .. 6=Sáb
        if (Number(b.dia_semana) !== dow) return false;
      }
    } else {
      if (fecha < b.fecha_desde || fecha > b.fecha_hasta) return false;
    }
    // profesional (NULL en el bloqueo = todos los profes del área)
    // Acepta tanto email como nombre corto ('BRUNO') gracias a aEmail()
    if (b.profesional_email && profeEmail) {
      if (b.profesional_email.toLowerCase() !== aEmail(profeEmail)) return false;
    }
    // práctica (NULL = todas)
    if (b.practica_codigo && practica && b.practica_codigo !== practica) return false;
    // horario
    return hayOverlap(horaIni, horaFin, b.hora_desde, b.hora_hasta);
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------
  const Bloqueos = {

    /** Permite setear el cliente Supabase manualmente si no se llama `sb`. */
    setCliente(client) {
      _supabaseClient = client;
    },

    /** Carga la lista de bloqueos activos desde la base. Devuelve la cantidad. */
    async cargar() {
      const cli = obtenerCliente();
      if (!cli) {
        console.warn('[Bloqueos] No hay cliente Supabase disponible.');
        _bloqueos = [];
        return 0;
      }
      const hoy = new Date().toISOString().substring(0, 10);
      const { data, error } = await cli
        .from('bloqueos_agenda')
        .select('*')
        .eq('activo', true)
        .gte('fecha_hasta', hoy);
      if (error) {
        console.error('[Bloqueos] Error al cargar:', error.message);
        _bloqueos = [];
        return 0;
      }
      _bloqueos = data || [];
      return _bloqueos.length;
    },

    /** Alias de cargar(). */
    async refrescar() {
      return this.cargar();
    },

    /** Devuelve todos los bloqueos cacheados (solo lectura). */
    lista() {
      return _bloqueos.slice();
    },

    /**
     * Devuelve `true` si el slot consultado está bloqueado.
     * @param {string} area  'TF' | 'CONSULTORIOS' | 'BIOLAB' | 'MASOTERAPIA'
     * @param {string} fecha 'YYYY-MM-DD'
     * @param {string=} horaIni 'HH:MM' (opcional)
     * @param {string=} horaFin 'HH:MM' (opcional, si no se pasa se asume slot puntual)
     * @param {string=} profeEmail email del profesional (opcional)
     * @param {string=} practica código de práctica (opcional, p.ej. 'FISIO')
     */
    aplica(area, fecha, horaIni, horaFin, profeEmail, practica) {
      return _bloqueos.some(b =>
        aplicaABloque(b, area, fecha, horaIni, horaFin, profeEmail, practica)
      );
    },

    /**
     * Devuelve el primer bloqueo que aplica (o null).
     * Útil para mostrar el motivo en pantalla.
     */
    queAplica(area, fecha, horaIni, horaFin, profeEmail, practica) {
      return _bloqueos.find(b =>
        aplicaABloque(b, area, fecha, horaIni, horaFin, profeEmail, practica)
      ) || null;
    },

    /**
     * Devuelve todos los bloqueos que aplican (puede haber más de uno).
     */
    todosLosQueAplican(area, fecha, horaIni, horaFin, profeEmail, practica) {
      return _bloqueos.filter(b =>
        aplicaABloque(b, area, fecha, horaIni, horaFin, profeEmail, practica)
      );
    },

    /**
     * Helper "guardia" para usar antes de INSERTAR un turno.
     * Refresca la cache (por las dudas), chequea, y si está bloqueado muestra
     * un alert con el motivo y devuelve `true` (= NO se debe guardar).
     *
     *   if (await Bloqueos.bloquearOk('CONSULTORIOS', fecha, hora, hora_fin, profeEmail, practica)) return;
     *
     * Devuelve:
     *   - true  → está bloqueado, no guardar
     *   - false → libre, podés seguir
     */
    async bloquearOk(area, fecha, horaIni, horaFin, profeEmail, practica) {
      await this.refrescar();
      const b = this.queAplica(area, fecha, horaIni, horaFin, profeEmail, practica);
      if (!b) return false;
      const rango = (b.fecha_desde === b.fecha_hasta)
        ? b.fecha_desde
        : `${b.fecha_desde} → ${b.fecha_hasta}`;
      const hr = (b.hora_desde && b.hora_hasta)
        ? `${b.hora_desde.substring(0,5)}–${b.hora_hasta.substring(0,5)}`
        : 'día completo';
      alert(
        `🚫 Bloqueado por administración\n\n` +
        `${b.area} · ${rango} · ${hr}\n` +
        `Motivo: ${b.motivo}\n\n` +
        `Si necesitás reservar acá, hablá con Lu o Jime para que liberen el bloqueo en Gestión de Cupo.`
      );
      return true;
    },

    /**
     * Registra un callback que se dispara cuando hay cambios en la tabla
     * bloqueos_agenda en cualquier pestaña / dispositivo (realtime).
     * Auto-refresca la cache antes de llamar al callback.
     */
    escucharCambios(callback) {
      if (typeof callback === 'function') _callbacksCambio.push(callback);
      if (_suscripcion) return;  // ya hay suscripción activa
      const cli = obtenerCliente();
      if (!cli || !cli.channel) return;
      _suscripcion = cli.channel('bloqueos-agenda-realtime')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'bloqueos_agenda' },
            async () => {
              await Bloqueos.refrescar();
              _callbacksCambio.forEach(cb => { try { cb(); } catch(e) { console.error(e); } });
            })
        .subscribe();
    },

    /** Texto corto para mostrar en un overlay de slot. */
    rotuloCorto(b) {
      if (!b) return 'BLOQUEADO';
      const motivo = (b.motivo || '').toString().trim();
      if (!motivo) return 'BLOQUEADO';
      return motivo.length > 40 ? motivo.substring(0, 38) + '…' : motivo;
    },
  };

  // Exportar al global
  window.Bloqueos = Bloqueos;

  // Inyectar CSS mínimo del overlay (se aplica donde el agenda agregue la clase)
  if (!document.getElementById('bloqueos-css')) {
    const css = document.createElement('style');
    css.id = 'bloqueos-css';
    css.textContent = `
      .slot-bloqueado, .turno-bloqueado, .modulo-bloqueado, [data-bloqueado="true"] {
        position: relative !important;
        background: repeating-linear-gradient(
          45deg,
          rgba(239, 68, 68, 0.18) 0 8px,
          rgba(239, 68, 68, 0.08) 8px 16px
        ) !important;
        border: 1px dashed rgba(239, 68, 68, 0.6) !important;
        color: #b91c1c !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
      }
      .slot-bloqueado *, .turno-bloqueado *, .modulo-bloqueado * { display: none !important; }
      .slot-bloqueado::after, .turno-bloqueado::after, .modulo-bloqueado::after,
      [data-bloqueado="true"]::after {
        content: attr(data-bloqueo-motivo);
        position: absolute;
        inset: 0;
        display: flex !important;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #b91c1c;
        text-align: center;
        padding: 2px 4px;
        line-height: 1.1;
        pointer-events: none;
      }
    `;
    document.head.appendChild(css);
  }
})();
