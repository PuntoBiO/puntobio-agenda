/* =====================================================================
   NOTAS DEL PACIENTE — componente compartido
   Se usa en: administracion_terapia_fisica.html, padron.html, historias_clinicas.html
   Tabla: notas_paciente (ver sql_notas_paciente.sql)

   Dos tipos:
     ⚠️ IMPORTANTE  → se ve hasta una fecha (7 / 15 / 30 días o fecha a elección)
     🔁 SIEMPRE     → recurrente, se ve siempre hasta que alguien la quite
   Nada se borra: "Quitar" la manda a "anteriores" con quién y cuándo.

   Uso:  NotasPaciente.montar(elemento, { sb, personaId, soloLectura })
===================================================================== */
(function () {
  'use strict';

  const EMAILS_PUEDEN_QUITAR_TODO = [
    'liclucianavelaz@gmail.com', // Lu
    'jimenahllorente@gmail.com'  // Jime
  ];
  const DIAS_DEFAULT = 15;

  let _usuario = null;        // { email, nombre }
  let _usuarioPromesa = null;

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Fecha de HOY en hora local (Córdoba), como 'YYYY-MM-DD' — sin pasar por UTC
  function hoyISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function sumarDias(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    const f = new Date(y, m - 1, d + n);
    return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
  }
  function fechaCorta(iso) { // 'YYYY-MM-DD' o timestamp → 'dd/mm/aa'
    if (!iso) return '';
    let s = String(iso);
    if (s.length > 10) { // timestamp: pasarlo a fecha local
      const d = new Date(s);
      s = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    const [y, m, d] = s.slice(0, 10).split('-');
    return d + '/' + m + '/' + y.slice(2);
  }
  function nombreCorto(n) {
    return String(n || '').trim().split(/\s+/).slice(0, 2).join(' ').toUpperCase();
  }
  function diasHasta(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const [hy, hm, hd] = hoyISO().split('-').map(Number);
    return Math.round((new Date(y, m - 1, d) - new Date(hy, hm - 1, hd)) / 86400000);
  }
  function vigente(n) {
    if (n.quitada_en) return false;
    if (n.tipo === 'siempre') return true;
    return !!n.vence_el && n.vence_el >= hoyISO();
  }

  async function usuario(sb) {
    if (_usuario) return _usuario;
    if (_usuarioPromesa) return _usuarioPromesa;
    _usuarioPromesa = (async () => {
      try {
        const { data } = await sb.auth.getUser();
        const user = data && data.user;
        if (!user) return null;
        const email = (user.email || '').toLowerCase().trim();
        let nombre = email.split('@')[0];
        try {
          const { data: p } = await sb.from('personas').select('nombre').ilike('email', email).maybeSingle();
          if (p && p.nombre) nombre = p.nombre;
        } catch (e) { /* queda el email */ }
        _usuario = { email, nombre };
        return _usuario;
      } catch (e) { return null; } finally { _usuarioPromesa = null; }
    })();
    return _usuarioPromesa;
  }

  /* ---------- estilos (una sola vez) ---------- */
  function inyectarEstilos() {
    if (document.getElementById('np-estilos')) return;
    const st = document.createElement('style');
    st.id = 'np-estilos';
    st.textContent = `
      .np-box{border:1px solid #e2e8f0;border-radius:12px;background:#fff;margin:0 0 14px 0;overflow:hidden;font-size:13px;color:#0f172a}
      .np-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
      .np-tit{font-weight:800;font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:#334155}
      .np-btn{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
      .np-btn:disabled{opacity:.6;cursor:default}
      .np-btn.prim{background:#1e9fe0;border-color:#1e9fe0;color:#fff}
      .np-list{padding:8px 10px;display:flex;flex-direction:column;gap:7px}
      .np-vacio{padding:10px 12px;color:#94a3b8;font-style:italic}
      .np-nota{border-radius:9px;padding:8px 10px;border-left:4px solid}
      .np-nota.siempre{background:#eff6ff;border-color:#3b82f6}
      .np-nota.importante{background:#fffbeb;border-color:#f59e0b}
      .np-nota.importante.urgente{background:#fef2f2;border-color:#ef4444}
      .np-nota.vieja{background:#f8fafc;border-color:#cbd5e1;color:#64748b}
      .np-chip{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.3px;padding:2px 7px;border-radius:5px;margin-right:6px;text-transform:uppercase}
      .np-nota.siempre .np-chip{background:#dbeafe;color:#1e40af}
      .np-nota.importante .np-chip{background:#fde68a;color:#92400e}
      .np-nota.importante.urgente .np-chip{background:#fecaca;color:#991b1b}
      .np-nota.vieja .np-chip{background:#e2e8f0;color:#64748b}
      .np-texto{white-space:pre-wrap;word-break:break-word;margin-top:4px;line-height:1.4}
      .np-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:5px;font-size:11px;color:#64748b;flex-wrap:wrap}
      .np-quitar{border:none;background:none;color:#64748b;font-size:11px;font-weight:700;cursor:pointer;padding:2px 4px;text-decoration:underline;font-family:inherit}
      .np-form{padding:10px 12px;border-top:1px solid #e2e8f0;background:#fcfcfd;display:flex;flex-direction:column;gap:8px}
      .np-form textarea{width:100%;box-sizing:border-box;min-height:60px;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:13px;font-family:inherit;resize:vertical}
      .np-fila{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
      .np-op{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;color:#334155;font-family:inherit}
      .np-op.on{background:#0f172a;border-color:#0f172a;color:#fff}
      .np-op.on.imp{background:#f59e0b;border-color:#f59e0b}
      .np-op.on.siem{background:#3b82f6;border-color:#3b82f6}
      .np-form input[type=date]{border:1px solid #cbd5e1;border-radius:8px;padding:4px 6px;font-size:12px;font-family:inherit}
      .np-ant{padding:0 10px 8px}
      .np-ant summary{cursor:pointer;font-size:12px;font-weight:700;color:#64748b;padding:4px 2px;list-style:none}
      .np-ant .np-list{padding:4px 0 0}
    `;
    document.head.appendChild(st);
  }

  /* ---------- render ---------- */
  function tarjeta(n, u, soloLectura, esVieja) {
    let chip, clase = n.tipo;
    if (esVieja) {
      clase += ' vieja';
      chip = n.quitada_en ? 'Quitada' : 'Vencida ' + fechaCorta(n.vence_el);
    } else if (n.tipo === 'siempre') {
      chip = '🔁 Siempre';
    } else {
      const d = diasHasta(n.vence_el);
      if (d <= 2) clase += ' urgente';
      chip = '⚠️ Importante · ' + (d === 0 ? 'último día' : 'hasta ' + fechaCorta(n.vence_el));
    }
    const puedeQuitar = !esVieja && !soloLectura && u &&
      (u.email === (n.autor_email || '').toLowerCase() || EMAILS_PUEDEN_QUITAR_TODO.includes(u.email));
    const quitadaTxt = n.quitada_en ? ' · quitada ' + fechaCorta(n.quitada_en) + (n.quitada_por ? ' por ' + esc(nombreCorto(n.quitada_por)) : '') : '';
    return `<div class="np-nota ${clase}">
      <span class="np-chip">${esc(chip)}</span>
      <div class="np-texto">${esc(n.texto)}</div>
      <div class="np-meta">
        <span>${esc(nombreCorto(n.autor_nombre) || 'Equipo')} · ${fechaCorta(n.creado_en)}${quitadaTxt}</span>
        ${puedeQuitar ? `<button class="np-quitar" data-quitar="${n.id}">Quitar</button>` : ''}
      </div>
    </div>`;
  }

  function pintar(est) {
    const { el, notas, u, soloLectura } = est;
    const vivas = notas.filter(vigente)
      .sort((a, b) => (a.tipo === b.tipo ? (b.creado_en > a.creado_en ? 1 : -1) : (a.tipo === 'importante' ? -1 : 1)));
    const viejas = notas.filter(n => !vigente(n));
    const puedeEscribir = !soloLectura && !!u;

    el.innerHTML = `<div class="np-box">
      <div class="np-head">
        <span class="np-tit">📌 Notas del paciente${vivas.length ? ' (' + vivas.length + ')' : ''}</span>
        ${puedeEscribir && !est.formAbierto ? '<button class="np-btn" data-accion="abrir">+ Nota</button>' : ''}
      </div>
      ${est.error ? `<div class="np-vacio" style="color:#b91c1c;font-style:normal">${esc(est.error)}</div>` : ''}
      ${vivas.length
        ? `<div class="np-list">${vivas.map(n => tarjeta(n, u, soloLectura, false)).join('')}</div>`
        : (!est.error && !est.formAbierto ? '<div class="np-vacio">Sin notas vigentes.</div>' : '')}
      ${est.formAbierto ? formHtml(est) : ''}
      ${viejas.length ? `<details class="np-ant"><summary>▸ Ver anteriores (${viejas.length})</summary>
        <div class="np-list">${viejas.map(n => tarjeta(n, u, soloLectura, true)).join('')}</div></details>` : ''}
    </div>`;
    if (est.formAbierto) {
      const ta = el.querySelector('#np-texto-' + est.uid);
      if (ta) { ta.value = est.borrador || ''; ta.focus(); }
    }
  }

  function formHtml(est) {
    const t = est.tipoNuevo, dur = est.duracion;
    const op = (val, txt) => `<button type="button" class="np-op ${dur === val ? 'on' : ''}" data-dur="${val}">${txt}</button>`;
    return `<div class="np-form">
      <div class="np-fila">
        <button type="button" class="np-op imp ${t === 'importante' ? 'on' : ''}" data-tipo="importante">⚠️ Importante (por un tiempo)</button>
        <button type="button" class="np-op siem ${t === 'siempre' ? 'on' : ''}" data-tipo="siempre">🔁 Siempre</button>
      </div>
      <textarea id="np-texto-${est.uid}" placeholder="${t === 'siempre' ? 'Ej: paga siempre por transferencia el día 12 · avisar cambios a la hija' : 'Ej: viene con dolor lumbar, bajar carga esta semana'}"></textarea>
      ${t === 'importante' ? `<div class="np-fila"><span style="font-size:12px;color:#64748b;font-weight:700">Que se vea:</span>
        ${op('7', '7 días')}${op('15', '15 días')}${op('30', '30 días')}${op('fecha', 'Hasta…')}
        ${dur === 'fecha' ? `<input type="date" id="np-fecha-${est.uid}" min="${hoyISO()}" value="${est.fechaElegida || sumarDias(hoyISO(), DIAS_DEFAULT)}">` : ''}
      </div>` : '<div style="font-size:12px;color:#64748b">Se va a ver siempre, hasta que alguien la quite.</div>'}
      <div class="np-fila" style="justify-content:flex-end">
        <button type="button" class="np-btn" data-accion="cancelar">Cancelar</button>
        <button type="button" class="np-btn prim" data-accion="guardar">Guardar nota</button>
      </div>
    </div>`;
  }

  async function cargar(est) {
    const { data, error } = await est.sb.from('notas_paciente')
      .select('*').eq('persona_id', est.personaId)
      .order('creado_en', { ascending: false }).order('id', { ascending: false });
    if (error) throw error;
    est.notas = data || [];
  }

  async function guardar(est, btn) {
    const ta = est.el.querySelector('#np-texto-' + est.uid);
    const texto = (ta && ta.value || '').trim();
    if (!texto) { ta && ta.focus(); return; }
    let vence = null;
    if (est.tipoNuevo === 'importante') {
      if (est.duracion === 'fecha') {
        const fi = est.el.querySelector('#np-fecha-' + est.uid);
        vence = fi && fi.value;
        if (!vence || vence < hoyISO()) { alert('Elegí una fecha de hoy en adelante.'); return; }
      } else {
        vence = sumarDias(hoyISO(), Number(est.duracion) - 1); // 7 días = hoy + 6
      }
    }
    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      const { error } = await est.sb.from('notas_paciente').insert({
        persona_id: est.personaId,
        tipo: est.tipoNuevo,
        texto,
        vence_el: vence,
        autor_email: est.u.email,
        autor_nombre: est.u.nombre
      });
      if (error) throw error;
      est.formAbierto = false; est.borrador = '';
      await cargar(est);
      pintar(est);
    } catch (e) {
      alert('No se pudo guardar la nota: ' + e.message);
      btn.disabled = false; btn.textContent = 'Guardar nota';
    }
  }

  async function quitar(est, id) {
    if (!confirm('¿Quitar esta nota? Va a quedar en "anteriores".')) return;
    try {
      const { error } = await est.sb.from('notas_paciente')
        .update({ quitada_en: new Date().toISOString(), quitada_por: est.u.nombre || est.u.email })
        .eq('id', id);
      if (error) throw error;
      await cargar(est);
      pintar(est);
    } catch (e) { alert('No se pudo quitar la nota: ' + e.message); }
  }

  let _uidSeq = 0;
  async function montar(el, opts) {
    if (!el || !opts || !opts.sb || opts.personaId == null) return;
    inyectarEstilos();
    const est = {
      el, sb: opts.sb, personaId: opts.personaId, soloLectura: !!opts.soloLectura,
      uid: ++_uidSeq, notas: [], u: null, error: '',
      formAbierto: false, tipoNuevo: 'importante', duracion: String(DIAS_DEFAULT), fechaElegida: '', borrador: ''
    };
    el.innerHTML = '<div class="np-box"><div class="np-head"><span class="np-tit">📌 Notas del paciente</span></div><div class="np-vacio">Cargando…</div></div>';
    try {
      est.u = await usuario(est.sb);
      await cargar(est);
    } catch (e) {
      est.error = /notas_paciente/.test(e.message || '') ? 'Falta crear la tabla de notas (correr el SQL).' : 'No se pudieron cargar las notas: ' + e.message;
    }
    el.__npEst = est;
    pintar(est);

    if (el.__npEnganchado) return;
    el.__npEnganchado = true;
    el.addEventListener('click', (ev) => {
      const s = el.__npEst; if (!s) return;
      const b = ev.target.closest('button'); if (!b || !el.contains(b)) return;
      const ta = el.querySelector('#np-texto-' + s.uid);
      if (ta) s.borrador = ta.value;
      const fi = el.querySelector('#np-fecha-' + s.uid);
      if (fi) s.fechaElegida = fi.value;
      if (b.dataset.quitar) return quitar(s, b.dataset.quitar);
      if (b.dataset.tipo) { s.tipoNuevo = b.dataset.tipo; return pintar(s); }
      if (b.dataset.dur) { s.duracion = b.dataset.dur; return pintar(s); }
      const a = b.dataset.accion;
      if (a === 'abrir') { s.formAbierto = true; s.tipoNuevo = 'importante'; s.duracion = String(DIAS_DEFAULT); s.borrador = ''; return pintar(s); }
      if (a === 'cancelar') { s.formAbierto = false; s.borrador = ''; return pintar(s); }
      if (a === 'guardar') return guardar(s, b);
    });
  }

  window.NotasPaciente = { montar };
})();
