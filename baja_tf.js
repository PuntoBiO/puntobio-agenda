/* =====================================================================
   BAJAS TF — HOY o PROGRAMADA (componente compartido, 8/10/26)
   Lo usan: administracion_terapia_fisica.html, padron.html, morosos_tf.html
   La lógica vive en la base (sql_bajas_programadas.sql):
     fn_baja_tf · fn_cancelar_baja_programada · fn_efectivizar_bajas_programadas
===================================================================== */
(function () {
  'use strict';

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function hoyISO() { return iso(new Date()); }
  function fechaArg(s) {
    if (!s) return '';
    const [y, m, d] = String(s).slice(0, 10).split('-');
    return d + '/' + m + '/' + y;
  }
  function diaMenos1(s) {
    const [y, m, d] = s.split('-').map(Number);
    return iso(new Date(y, m - 1, d - 1));
  }
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function diaSemana(s) {
    const [y, m, d] = s.split('-').map(Number);
    return DIAS[new Date(y, m - 1, d).getDay()];
  }

  // Próxima fecha de vencimiento (desde mañana). Día 31 en un mes de 30 → último día del mes.
  function proximoVencimiento(diaVenc) {
    const dv = Math.max(1, Math.min(31, Number(diaVenc) || 1));
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    for (let k = 0; k < 3; k++) {
      const y = hoy.getFullYear(), m = hoy.getMonth() + k;
      const ultimo = new Date(y, m + 1, 0).getDate();
      const f = new Date(y, m, Math.min(dv, ultimo));
      if (f > hoy) return iso(f);
    }
    const f = new Date(hoy); f.setDate(f.getDate() + 30); return iso(f);
  }

  function estilos() {
    if (document.getElementById('bajatf-estilos')) return;
    const st = document.createElement('style');
    st.id = 'bajatf-estilos';
    st.textContent = `
      #btf-box .btf-op{display:flex;gap:10px;align-items:flex-start;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;cursor:pointer;margin-bottom:8px;background:#fff;font-size:13px;line-height:1.4;text-transform:none;letter-spacing:0;color:#0f172a}
      #btf-box input[type=radio]{margin-top:3px;width:auto!important}
      #btf-box .btf-op.on{border-color:#1e9fe0;background:#eff8fe}
      #btf-box .btf-op b{font-size:14px}
      .btf-fecha{margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .btf-fecha input{width:auto!important;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}
      .btf-hint{font-size:12px;color:#475569;margin-top:6px}
      .btf-chip{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#fff7ed;border:1px solid #fdba74;border-left:4px solid #f97316;border-radius:10px;padding:10px 12px;margin:0 0 12px 0;font-size:13px;color:#7c2d12}
      .btf-chip button{border:1px solid #f97316;background:#fff;color:#c2410c;border-radius:8px;padding:5px 10px;font-weight:700;font-size:12px;cursor:pointer;font-family:inherit}
      .btf-badge{background:#ffedd5;color:#c2410c;border:1px solid #fdba74;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;white-space:nowrap}
    `;
    document.head.appendChild(st);
  }

  // Bloque "¿Cuándo?" del modal de baja. Por defecto: programada al próximo vencimiento.
  // porDefecto: 'prog' (fichas) o 'hoy' (Morosos: ya está vencido y debe)
  function htmlOpciones(insc, porDefecto) {
    const prog = porDefecto !== 'hoy';
    estilos();
    const def = (insc && insc.baja_programada_el) || proximoVencimiento(insc && insc.dia_vencimiento);
    return `
      <div class="form-group" id="btf-box">
        <label>¿Cuándo es la baja?</label>
        <label class="btf-op ${prog ? 'on' : ''}" id="btf-op-prog">
          <input type="radio" name="btf-cuando" value="prog" ${prog ? 'checked' : ''} onchange="BajaTF._marcar()">
          <div style="flex:1">
            <b>📅 Programarla</b>${prog ? ' (recomendado: el día que se le vence)' : ''}
            <div class="btf-fecha">Pasa a baja el <input type="date" id="btf-fecha" min="${iso(new Date(Date.now() + 86400000))}" value="${def}" oninput="BajaTF._marcar()"></div>
            <div class="btf-hint" id="btf-hint"></div>
          </div>
        </label>
        <label class="btf-op ${prog ? '' : 'on'}" id="btf-op-hoy">
          <input type="radio" name="btf-cuando" value="hoy" ${prog ? '' : 'checked'} onchange="BajaTF._marcar()">
          <div><b>⚡ Hoy</b><div class="btf-hint">Se va de la agenda ya; ayer fue su último día.</div></div>
        </label>
      </div>`;
  }
  function _marcar() {
    const prog = (document.querySelector('input[name="btf-cuando"]:checked') || {}).value === 'prog';
    const a = document.getElementById('btf-op-prog'), b = document.getElementById('btf-op-hoy');
    if (a) a.classList.toggle('on', prog);
    if (b) b.classList.toggle('on', !prog);
    const f = (document.getElementById('btf-fecha') || {}).value;
    const h = document.getElementById('btf-hint');
    if (h) h.innerHTML = (f && f > hoyISO())
      ? `Sigue viniendo hasta el <b>${diaSemana(diaMenos1(f))} ${fechaArg(diaMenos1(f))}</b>. Desde el ${fechaArg(f)} su lugar queda libre y pasa a BAJA solo. No se le reclama la cuota nueva.`
      : 'Elegí una fecha a partir de mañana.';
    const btn = document.getElementById('btnConfirmarBaja');
    if (btn) btn.textContent = prog ? 'Programar baja' : 'Confirmar baja';
  }
  function leerOpciones() {
    const prog = (document.querySelector('input[name="btf-cuando"]:checked') || {}).value === 'prog';
    const fecha = prog ? (document.getElementById('btf-fecha') || {}).value : null;
    return { programar: prog, fecha };
  }

  // Ejecuta la baja. Devuelve { tipo:'hoy'|'programada', fecha, turnos }
  async function ejecutar(client, inscripcionId, motivo) {
    const o = leerOpciones();
    if (o.programar && (!o.fecha || o.fecha <= hoyISO())) throw new Error('Elegí una fecha a partir de mañana para programar la baja.');
    const { data, error } = await client.rpc('fn_baja_tf', {
      p_inscripcion_id: inscripcionId,
      p_fecha: o.programar ? o.fecha : hoyISO(),
      p_motivo: motivo
    });
    if (error) throw error;
    return data || {};
  }
  function mensaje(res, nombre) {
    if (res.tipo === 'programada') return `📅 Baja programada${nombre ? ' de ' + nombre : ''} para el ${fechaArg(res.fecha)} · viene hasta el ${fechaArg(diaMenos1(res.fecha))}`;
    return `✓ Baja registrada${nombre ? ': ' + nombre : ''}. ${res.turnos || 0} turno(s) liberado(s)`;
  }

  async function cancelar(client, inscripcionId) {
    const { error } = await client.rpc('fn_cancelar_baja_programada', { p_inscripcion_id: inscripcionId });
    if (error) throw error;
  }
  async function efectivizar(client) {
    try { await client.rpc('fn_efectivizar_bajas_programadas'); } catch (e) { /* lo hace el cron igual */ }
  }

  // Cartel naranja para la ficha. onCancelar = nombre de una función global.
  function htmlChip(insc, onCancelar) {
    if (!insc || !insc.baja_programada_el || insc.estado !== 'ACTIVO') return '';
    estilos();
    const f = insc.baja_programada_el;
    return `<div class="btf-chip">
      <div>📅 <b>Baja programada para el ${diaSemana(f)} ${fechaArg(f)}</b>${insc.baja_programada_motivo ? ' · ' + String(insc.baja_programada_motivo).replace(/[<>&]/g, '') : ''}<br>
      <span style="font-size:12px">Viene hasta el ${fechaArg(diaMenos1(f))}. Ese día pasa a BAJA solo.</span></div>
      ${onCancelar ? `<button onclick="${onCancelar}(${insc.id})">↩️ Cancelar baja</button>` : ''}
    </div>`;
  }
  function htmlBadge(insc) {
    if (!insc || !insc.baja_programada_el || insc.estado !== 'ACTIVO') return '';
    estilos();
    return ` <span class="btf-badge" title="Baja programada">📅 baja ${fechaArg(insc.baja_programada_el).slice(0, 5)}</span>`;
  }

  window.BajaTF = { proximoVencimiento, htmlOpciones, _marcar, leerOpciones, ejecutar, mensaje, cancelar, efectivizar, htmlChip, htmlBadge };
})();
