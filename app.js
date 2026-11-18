/* Presupuesto 2027 · Carmen de Areco
   Sin dependencias externas. Datos: datos/datos.js (presupuesto 2027) y datos/serie.js (serie en pesos de 2027),
   generados por 11_Tablero/generar_datos.py y 11_Tablero/generar_serie_real.py. */
(function () {
  'use strict';
  const D = window.PRESUPUESTO;
  const S = window.SERIE_REAL;
  if (!D || !S) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:20px;background:#fee">No se pudieron cargar los datos del presupuesto.</p>'); return; }

  /* ---------- formato ---------- */
  const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const M = (v) => { const m = v / 1e6; if (Math.abs(m) < 0.95) return '$' + nf0.format(v / 1000) + ' mil'; return '$' + (Math.abs(m) >= 100 ? nf0 : nf1).format(m) + ' M'; };
  const P = (v) => nf1.format(v * 100) + '%';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, txt, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; if (parent) parent.append(e); return e; };
  const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);
  const groupSum = (rows, key, val = (r) => r.importe) => { const m = new Map(); rows.forEach((r) => { const k = key(r); m.set(k, (m.get(k) || 0) + val(r)); }); return [...m.entries()]; };
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const AREA = {
    'Secretaría de Planificación': { c: 'var(--azul)', corto: 'Planificación' },
    'Secretaría de Derechos Humanos': { c: 'var(--turquesa)', corto: 'Derechos Humanos' },
    'Secretaría de Hacienda y Finanzas': { c: 'var(--agua)', corto: 'Hacienda y Finanzas' },
    'Secretaría de Gobierno': { c: 'var(--verde)', corto: 'Gobierno' },
    'Conducción Superior': { c: 'var(--lima)', corto: 'Conducción Superior' },
    'Honorable Concejo Deliberante': { c: 'var(--gris)', corto: 'Concejo Deliberante' },
    'Servicios de la Deuda': { c: 'var(--marino)', corto: 'Deuda' },
  };
  const areaC = (n) => (AREA[n] || {}).c || 'var(--gris)';
  const areaCorto = (n) => (AREA[n] || {}).corto || n;
  const INC_C = ['', 'var(--azul)', 'var(--turquesa)', 'var(--agua)', 'var(--verde)', 'var(--lima)', 'var(--gris)', 'var(--marino)'];

  /* Destinos del ticket: funciones del clasificador agrupadas en lenguaje llano */
  const DESTINOS = [
    { n: 'Obras, calles y caminos', f: ['Planeamiento y desarrollo urbano'], c: 'var(--azul)' },
    { n: 'Limpieza, residuos y espacios verdes', f: ['Recolección de residuos, barrido y limpieza', 'Otros servivicios urbanos', 'Ecología y medio ambiente'], c: 'var(--agua)' },
    { n: 'Administración y recaudación', f: ['Administración Fiscal'], c: 'var(--gris)' },
    { n: 'Educación', f: ['Educación elemental', 'Educación superior y universitaria'], c: 'var(--turquesa)' },
    { n: 'Salud', f: ['Salud'], c: 'var(--verde)' },
    { n: 'Seguridad y tránsito', f: ['Seguridad interior'], c: 'var(--marino)' },
    { n: 'Acción social, niñez y juventud', f: ['Promoción y asistencia social'], c: 'var(--lima)' },
    { n: 'Gobierno, inspección y comunicación', f: ['Dirección superior ejecutiva', 'Judicial', 'Información y estadísticas básicas'], c: 'var(--gris)' },
    { n: 'Turismo, cultura y deporte', f: ['Comercio, turismo y otros servicios', 'Cultura (incluye culto)', 'Deporte y recreación'], c: 'var(--verde)' },
    { n: 'Alumbrado público', f: ['Alumbrado público'], c: 'var(--lima)' },
    { n: 'Agua y cloacas', f: ['Agua potable y alcantarillado'], c: 'var(--turquesa)' },
    { n: 'Concejo Deliberante', f: ['Legislativa'], c: 'var(--gris)' },
    { n: 'Deuda', f: ['Servicios de la deuda pública (intereses y'], c: 'var(--marino)' },
    { n: 'Cementerio', f: ['Cementerios'], c: 'var(--agua)' },
  ];

  /* ---------- totales ---------- */
  const R = D.recursos, G = D.gastos, C = D.cargos;
  const totRec = sum(R, (r) => r.importe);
  const totGas = sum(G, (r) => r.importe);
  const prov = sum(R.filter((r) => r.origen === 'Provincial'), (r) => r.importe);
  const mun = sum(R.filter((r) => r.origen === 'Municipal'), (r) => r.importe);
  const afec = sum(R.filter((r) => r.afectado), (r) => r.importe);
  const pers = sum(G.filter((r) => r.inciso === 1), (r) => r.importe);
  const porArea = groupSum(G, (r) => r.jurisdiccion).sort((a, b) => b[1] - a[1]);
  // Censo Nacional de Población 2022 (INDEC), resultados definitivos, partido de Carmen de Areco
  const POBLACION = 17499;
  const pesos = (v) => '$' + nf0.format(Math.round(v));
  const valores = {
    por_hab: pesos(totGas / POBLACION), por_hab_mes: pesos(totGas / POBLACION / 12), rec_mun_hab: pesos(mun / POBLACION), poblacion: nf0.format(POBLACION),
    total: M(totGas), pct_prov: P(prov / totRec), pct_mun: P(mun / totRec), pct_afec: P(afec / totRec),
    pct_personal: P(pers / totGas), jur_top: 'La Secretaría de ' + areaCorto(porArea[0][0]), jur_top_pct: P(porArea[0][1] / totGas),
  };
  $$('[data-v]').forEach((e) => { e.textContent = valores[e.dataset.v] ?? '—'; });

  /* ---------- globo ---------- */
  const globo = $('#globo');
  function mostrarGlobo(ev, titulo, texto) {
    globo.replaceChildren(); el('b', null, titulo, globo); el('span', null, texto, globo); globo.hidden = false;
    const w = globo.offsetWidth, h = globo.offsetHeight;
    let x = ev.clientX + 14, y = ev.clientY + 16;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 14;
    if (y + h > innerHeight - 8) y = ev.clientY - h - 14;
    globo.style.left = Math.max(8, x) + 'px'; globo.style.top = Math.max(8, y) + 'px';
  }
  const ocultarGlobo = () => { globo.hidden = true; };

  /* ---------- filas con barra ---------- */
  function filas(cont, items, o = {}) {
    cont.replaceChildren();
    const max = Math.max(...items.map((i) => i.v));
    items.forEach((it) => {
      const f = el('div', 'fila', null, cont);
      const top = el('div', 'fila-top', null, f);
      el('span', 'l', it.n, top);
      const v = el('span', 'v', M(it.v), top);
      if (o.total) el('small', null, P(it.v / o.total), v);
      const b = el('div', 'barra-f', null, f);
      (it.partes || [{ v: it.v, c: it.c, trama: it.trama }]).forEach((p) => {
        const d = el('div', p.trama ? 'trama' : '', null, b);
        d.style.width = (max ? (p.v / max) * 100 : 0) + '%';
        d.style.backgroundColor = p.c || 'var(--azul)';
      });
      if (it.sub) el('div', 'sub', it.sub, f);
    });
  }

  /* ---------- ticket ---------- */
  const porFuncion = new Map(groupSum(G, (r) => r.funcion));
  const destinos = DESTINOS.map((d) => ({ ...d, v: sum(d.f, (f) => porFuncion.get(f) || 0) })).filter((d) => d.v > 0).sort((a, b) => b.v - a.v);
  const sinAsignar = totGas - sum(destinos, (d) => d.v);
  if (Math.abs(sinAsignar) > 1e6) destinos.push({ n: 'Otros', v: sinAsignar, c: 'var(--gris)' });
  const inMonto = $('#monto');
  const leerMonto = () => { const n = Number(String(inMonto.value).replace(/[^\d]/g, '')); return Number.isFinite(n) ? Math.min(n, 1e12) : 0; };
  function ticket() {
    const monto = leerMonto();
    const brutos = destinos.map((d) => (monto * d.v) / totGas);
    const base = brutos.map(Math.floor);
    let resto = Math.round(monto - sum(base, (x) => x));
    brutos.map((b, i) => [b - base[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (resto > 0) { base[i] += 1; resto -= 1; } });
    const ol = $('#ticket-lineas'); ol.replaceChildren();
    destinos.forEach((d, i) => {
      const li = el('li', null, null, ol);
      const c = el('i', 'c', null, li); c.style.background = d.c;
      const n = el('span', 'n', null, li); el('span', null, d.n, n);
      el('span', 'v', '$' + nf0.format(base[i]), li);
    });
    $('#ticket-total').textContent = '$' + nf0.format(monto);
    $$('.ticket-rapido button').forEach((b) => b.classList.toggle('activo', b.hasAttribute('data-hab') ? monto === Math.round(totGas / POBLACION) : Number(b.dataset.monto) === monto));
  }
  inMonto.addEventListener('input', () => {
    const n = leerMonto();
    const pos = inMonto.value.length - inMonto.selectionStart;
    inMonto.value = n ? nf0.format(n) : '';
    const p = Math.max(0, inMonto.value.length - pos); inMonto.setSelectionRange(p, p);
    ticket();
  });
  $$('.ticket-rapido button').forEach((b) => b.addEventListener('click', () => { inMonto.value = nf0.format(b.hasAttribute('data-hab') ? Math.round(totGas / POBLACION) : Number(b.dataset.monto)); ticket(); }));
  $('#ticket').addEventListener('submit', (e) => e.preventDefault());
  ticket();

  /* ---------- recursos ---------- */
  // Grupos en lenguaje llano, por código de recurso (clasificador RAFAM)
  const GRUPOS_REC = [
    { lado: 'prov', n: 'Coparticipación', d: 'La parte de los impuestos provinciales que se reparte entre los municipios.', t: (c) => c === '11.4.01.00' },
    { lado: 'prov', n: 'Fondo Educativo', d: 'Solo puede usarse en educación.', t: (c) => c === '11.4.05.00' },
    { lado: 'prov', n: 'Impuestos provinciales compartidos', d: 'Inmobiliario rural, automotor, ingresos brutos, juegos de azar y el 6 % de la energía eléctrica.', t: (c) => c.startsWith('11.9') },
    { lado: 'prov', n: 'Otros fondos provinciales', d: 'Fortalecimiento de recursos, inclusión social y Fondo de Inversión Municipal.', t: (c) => ['11.4.02.00', '11.4.03.00', '17.5.01.67'].includes(c) },
    { lado: 'prov', n: 'Programas y convenios', d: 'Policía comunal, Casa del Niño, Casa de Abrigo, Juegos Bonaerenses, Envión y otros.', t: (c) => c.startsWith('17.5') },
    { lado: 'mun', n: 'Servicios rurales', d: 'La tasa por el mantenimiento de los caminos rurales.', t: (c) => c.startsWith('12.1.03.0') && c !== '12.1.03.05' },
    { lado: 'mun', n: 'Tasas por servicios urbanos', d: 'Alumbrado, barrido y limpieza, servicios sanitarios, tasa vial urbana, seguridad, zoonosis y bomberos.', t: (c) => ['12.1.01', '12.1.02', '12.1.15', '12.1.17', '12.1.22', '12.1.03.05'].some((x) => c.startsWith(x)) },
    { lado: 'mun', n: 'Multas', d: 'Tránsito y seguridad vial, infracciones fiscales y normativas.', t: (c) => c.startsWith('12.6') || c === '12.9.06.00' },
    { lado: 'mun', n: 'Comercios e industrias', d: 'Inspección de seguridad e higiene y habilitaciones.', t: (c) => c.startsWith('12.1.05') || c.startsWith('12.1.04') },
    { lado: 'mun', n: 'Derechos y otros ingresos', d: 'Construcción, oficina, uso del espacio público, cementerio, marcas y señales, balneario, intereses y recuperos.', t: () => true },
  ];
  const ladoDe = (r) => (r.origen === 'Provincial' ? 'prov' : r.origen === 'Municipal' ? 'mun' : 'otro');
  const grupoDe = (r) => GRUPOS_REC.find((g) => g.lado === ladoDe(r) && g.t(r.cod));
  const LADOS = [
    { k: 'prov', n: 'La Provincia', d: 'envía', c: 'var(--turquesa)' },
    { k: 'mun', n: 'Vecinos y empresas', d: 'pagan', c: 'var(--azul)' },
  ];
  // de cada $100, con método del mayor resto para que sume 100
  const cienDe = (vals) => { const b = vals.map((v) => Math.floor((v / totRec) * 100)); let f = 100 - sum(b, (x) => x); vals.map((v, i) => [(v / totRec) * 100 - b[i], i]).sort((x, y) => y[0] - x[0]).forEach(([, i]) => { if (f > 0) { b[i] += 1; f -= 1; } }); return b; };
  const totLado = LADOS.map((l) => sum(R.filter((r) => ladoDe(r) === l.k), (r) => r.importe));
  const otros = sum(R.filter((r) => ladoDe(r) === 'otro'), (r) => r.importe);
  const cien = cienDe([...totLado, otros]);
  const barra = $('#cien');
  barra.setAttribute('aria-label', 'De cada 100 pesos: ' + LADOS.map((l, i) => cien[i] + ' los aporta ' + l.n).join(', '));
  LADOS.forEach((l, i) => { const s = el('div', null, null, barra); s.style.flex = String(totLado[i]); s.style.background = l.c; el('span', null, '$' + cien[i], s); });
  const quienes = $('#quienes');
  LADOS.forEach((l, i) => {
    const col = el('div', 'quien', null, quienes); col.style.setProperty('--c', l.c);
    const cab = el('div', 'quien-cab', null, col);
    el('p', 'quien-n', l.n + ' ' + l.d, cab);
    const big = el('p', 'quien-cien', null, cab); el('b', null, '$' + cien[i], big); big.append(' de cada $100');
    el('p', 'quien-m', M(totLado[i]) + ' en el año', cab);
    const items = GRUPOS_REC.filter((g) => g.lado === l.k).map((g) => ({ g, v: sum(R.filter((r) => ladoDe(r) === l.k && grupoDe(r) === g), (r) => r.importe) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
    const max = Math.max(...items.map((x) => x.v));
    const ul = el('ul', 'quien-lista', null, col);
    items.forEach(({ g, v }) => {
      const li = el('li', null, null, ul);
      const top = el('div', 'ql-top', null, li); el('span', 'ql-n', g.n, top); el('span', 'ql-v', M(v), top);
      const b = el('div', 'ql-bar', null, li); const fi = el('i', null, null, b); fi.style.width = (v / max) * 100 + '%';
      el('p', 'ql-d', g.d, li);
    });
  });
  if (otros) $('#otros-origen').textContent = 'Además, ' + M(otros) + ' llegan por donaciones al Hábitat y Banco de Tierras.';

  const fijo = afec, libre = totRec - afec;
  $('#pct-libre').textContent = '$' + Math.round((libre / totRec) * 100) + ' de cada $100';
  $('#pct-fijo').textContent = '$' + (100 - Math.round((libre / totRec) * 100)) + ' de cada $100';
  const db = $('#destino-barra');
  db.setAttribute('aria-label', P(libre / totRec) + ' de libre uso y ' + P(fijo / totRec) + ' con destino fijo');
  [[libre, 'Libre uso', ''], [fijo, 'Destino fijo', 'trama']].forEach(([v, n, cls]) => { const s = el('div', cls, null, db); s.style.flex = String(v); const sp = el('span', null, n, s); if (sp.scrollWidth > sp.clientWidth + 1) sp.textContent = n === 'Destino fijo' ? 'Fijo' : 'Libre'; });
  const EJ = { '11.4.05.00': 'el Fondo Educativo, en educación', '12.1.01.03': 'la tasa de alumbrado, en alumbrado público', '12.1.17.01': 'la tasa vial urbana, en calles', '17.5.01.13': 'Casa de Abrigo, en niñez y adolescencia', '17.5.01.01': 'el convenio de Policía Comunal, en seguridad' };
  const ej = $('#ejemplos-fijo');
  R.filter((r) => EJ[r.cod]).sort((a, b) => b.importe - a.importe).forEach((r) => { const li = el('li', null, null, ej); li.append(EJ[r.cod].charAt(0).toUpperCase() + EJ[r.cod].slice(1) + ': '); el('b', null, M(r.importe), li); });

  let filtroRec = '';
  const nombreLlano = (s) => s.replace(/\s+/g, ' ').replace(' ,', ',').replace(/\s*-\s*$/, '');
  function tablaRec() {
    const tb = $('#tabla-rec tbody'); tb.replaceChildren();
    const nrm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    [...R].filter((r) => !filtroRec || nrm(r.nombre + ' ' + r.cod).includes(nrm(filtroRec))).sort((a, b) => b.importe - a.importe).forEach((r) => {
      const tr = el('tr', null, null, tb);
      const td = el('td', null, nombreLlano(r.nombre), tr); el('small', null, r.cod + ' · ' + ((grupoDe(r) || {}).n || 'Donaciones'), td);
      el('td', null, ladoDe(r) === 'prov' ? 'Provincia' : ladoDe(r) === 'mun' ? 'Vecinos y empresas' : 'Donaciones', tr);
      el('td', null, r.afectado ? 'Destino fijo' : 'Libre', tr);
      el('td', 'num', M(r.importe), tr);
    });
  }
  $('#buscar-rec').addEventListener('input', (e) => { filtroRec = e.target.value; tablaRec(); });
  tablaRec();

  /* ---------- recorrido: quién pone → uso → área ---------- */
  const QUIEN = { prov: 'La Provincia', mun: 'Vecinos y empresas', otro: 'Donaciones' };
  const QCOL = { prov: 'var(--turquesa)', mun: 'var(--azul)', otro: 'var(--lima)' };
  const USO = { libre: 'Libre uso', fijo: 'Destino fijo' };
  const tramoA = new Map(); // quién|uso -> monto
  R.forEach((r) => { const k = ladoDe(r) + '|' + (r.afectado ? 'fijo' : 'libre'); tramoA.set(k, (tramoA.get(k) || 0) + r.importe); });
  const tramoB = new Map(); // uso|área -> monto
  G.forEach((r) => { const k = (r.fuente === '110' ? 'libre' : 'fijo') + '|' + r.jurisdiccion; tramoB.set(k, (tramoB.get(k) || 0) + r.importe); });
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (p) p.append(e); return e; };

  function recorrido() {
    const cont = $('#flujo'); cont.replaceChildren();
    const W = Math.floor(cont.clientWidth || 900);
    const izq = ['prov', 'mun', 'otro'].filter((q) => [...tramoA.keys()].some((k) => k.startsWith(q + '|')));
    const med = ['libre', 'fijo'];
    const der = porArea.map(([n]) => n);
    const valA = (q) => sum([...tramoA].filter(([k]) => k.startsWith(q + '|')), (x) => x[1]);
    const valM = (u) => sum([...tramoA].filter(([k]) => k.endsWith('|' + u)), (x) => x[1]);
    const valD = (a) => sum([...tramoB].filter(([k]) => k.endsWith('|' + a)), (x) => x[1]);

    if (W < 700) { // celular: tres barras apiladas
      const pila = (titulo, items) => {
        const f = el('div', 'pila', null, cont); el('p', 'pila-t', titulo, f);
        const bar = el('div', 'pila-b', null, f); bar.setAttribute('role', 'img');
        bar.setAttribute('aria-label', titulo + ': ' + items.map((i) => i.n + ' ' + M(i.v)).join('; '));
        items.forEach((i) => { const s = el('div', i.trama ? 'trama' : '', null, bar); s.style.flex = String(i.v); s.style.backgroundColor = i.c; });
        const l = el('ul', 'pila-l', null, f);
        items.forEach((i) => { const li = el('li', null, null, l); const sw = el('i', i.trama ? 'trama' : '', null, li); sw.style.backgroundColor = i.c; el('span', null, i.n, li); el('b', null, M(i.v), li); });
      };
      pila('Quién la pone', izq.map((q) => ({ n: QUIEN[q], v: valA(q), c: QCOL[q] })));
      el('div', 'pila-flecha', '↓', cont).setAttribute('aria-hidden', 'true');
      pila('Cómo se puede usar', med.map((u) => ({ n: USO[u], v: valM(u), c: 'var(--gris)', trama: u === 'fijo' })));
      el('div', 'pila-flecha', '↓', cont).setAttribute('aria-hidden', 'true');
      pila('Qué área la gasta', der.map((a) => ({ n: areaCorto(a), v: valD(a), c: areaC(a) })));
      return;
    }

    const lw = W < 1000 ? 150 : 180, rw = W < 1000 ? 160 : 190, nw = 14, pad = 22, top = 18;
    const H = Math.round(Math.max(440, Math.min(560, W * 0.46)));
    const k = (H - pad * (der.length - 1)) / totRec;
    const xs = [lw, lw + (W - lw - rw - nw) / 2, W - rw - nw];
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H + top * 2}`, width: '100%', role: 'img', 'aria-label': 'Recorrido del dinero: quién lo pone, si es de libre uso o tiene destino fijo, y qué área lo gasta.' }, cont);
    const defs = svgEl('defs', {}, svg);
    const pat = svgEl('pattern', { id: 'raya-flujo', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    const ln = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 6, 'stroke-width': 2.4 }, pat); ln.style.stroke = 'var(--papel)'; ln.style.strokeOpacity = '.85';
    const columna = (nombres, val, x) => {
      const alto = sum(nombres, (n) => val(n) * k) + pad * (nombres.length - 1);
      let y = top + (H - alto) / 2; const out = {};
      nombres.forEach((n) => { const v = val(n); out[n] = { n, v, x, y, h: Math.max(2, v * k), sal: y, ent: y }; y += v * k + pad; });
      return out;
    };
    const NI = columna(izq, valA, xs[0]), NM = columna(med, valM, xs[1]), ND = columna(der, valD, xs[2]);
    const gL = svgEl('g', {}, svg), gN = svgEl('g', {}, svg);
    const bandas = [];
    const banda = (desde, hasta, v, color, trama, claves, titulo) => {
      const h = v * k; if (h < 0.4) return;
      const x0 = desde.x + nw, x1 = hasta.x, xm = (x0 + x1) / 2, y0 = desde.sal, y1 = hasta.ent;
      desde.sal += h; hasta.ent += h;
      const d = `M${x0},${y0}C${xm},${y0} ${xm},${y1} ${x1},${y1}L${x1},${y1 + h}C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h}Z`;
      const p = svgEl('path', { d }, gL); p.style.fill = `color-mix(in srgb, ${color} 38%, var(--papel))`;
      p.dataset.k = claves.join('|'); bandas.push(p);
      if (trama) { const o = svgEl('path', { d, fill: 'url(#raya-flujo)' }, gL); o.style.pointerEvents = 'none'; o.dataset.k = p.dataset.k; bandas.push(o); }
      p.addEventListener('pointermove', (e) => mostrarGlobo(e, titulo, M(v) + ' · ' + P(v / totRec) + ' del total'));
      p.addEventListener('pointerleave', ocultarGlobo);
    };
    izq.forEach((q) => med.forEach((u) => { const v = tramoA.get(q + '|' + u) || 0; if (v) banda(NI[q], NM[u], v, QCOL[q], u === 'fijo', [q, u], QUIEN[q] + ' → ' + USO[u]); }));
    med.forEach((u) => der.forEach((a) => { const v = tramoB.get(u + '|' + a) || 0; if (v) banda(NM[u], ND[a], v, areaC(a), u === 'fijo', [u, a], USO[u] + ' → ' + areaCorto(a)); }));
    const resaltar = (clave) => { bandas.forEach((p) => { p.style.opacity = !clave || p.dataset.k.split('|').includes(clave) ? '' : '.15'; }); };
    const nodo = (nd, lado, nombre, color, trama, accion) => {
      const g = svgEl('g', { class: 'nodo' }, gN);
      const r = svgEl('rect', { x: nd.x, y: nd.y, width: nw, height: nd.h, rx: 2 }, g); r.style.fill = color;
      if (trama) svgEl('rect', { x: nd.x, y: nd.y, width: nw, height: nd.h, rx: 2, fill: 'url(#raya-flujo)' }, g);
      const tx = lado === 'izq' ? nd.x - 10 : nd.x + nw + 10, anc = lado === 'izq' ? 'end' : 'start';
      const t1 = svgEl('text', { x: tx, y: nd.y + nd.h / 2 - 3, 'text-anchor': anc, class: 'fl-n' }, g); t1.textContent = nombre;
      const t2 = svgEl('text', { x: tx, y: nd.y + nd.h / 2 + 13, 'text-anchor': anc, class: 'fl-v' }, g); t2.textContent = M(nd.v) + ' · ' + P(nd.v / totRec);
      g.addEventListener('pointerenter', () => resaltar(nd.n)); g.addEventListener('pointerleave', () => resaltar(''));
      if (accion) {
        g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', nombre + ', ' + M(nd.v) + '. Ver sus programas');
        g.style.cursor = 'pointer'; g.addEventListener('click', accion); g.addEventListener('keydown', (e) => { if (e.key === 'Enter') accion(); });
      }
    };
    izq.forEach((q) => nodo(NI[q], 'izq', QUIEN[q], QCOL[q], false));
    med.forEach((u) => nodo(NM[u], 'med', USO[u], 'var(--tinta-2)', u === 'fijo'));
    der.forEach((a) => nodo(ND[a], 'der', areaCorto(a), areaC(a), false, () => { areaSel = a; progSel = ''; dibujarMapa(); ficha(); $('#programas').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }));
  }

  /* ---------- gastos ---------- */
  filas($('#areas'), porArea.map(([n, v]) => ({ n, v, c: areaC(n) })), { total: totGas });
  const incNom = {}; G.forEach((r) => { incNom[r.inciso] = r.inciso_nombre; });
  filas($('#incisos'), groupSum(G, (r) => r.inciso).sort((a, b) => a[0] - b[0]).map(([i, v]) => ({ n: incNom[i], v, c: INC_C[i] })), { total: totGas });

  /* ---------- programas ---------- */
  const progs = new Map();
  G.forEach((r) => {
    const k = r.jur + '|' + r.prog;
    const p = progs.get(k) || { k, programa: r.programa, area: r.jurisdiccion, personal: 0, bys: 0, uso: 0, transf: 0, total: 0, filas: [] };
    if (r.inciso === 1) p.personal += r.importe; else if (r.inciso <= 3) p.bys += r.importe; else if (r.inciso === 4) p.uso += r.importe; else p.transf += r.importe;
    p.total += r.importe; p.filas.push(r); progs.set(k, p);
  });
  let areaSel = '';
  let progSel = '';

  const fa = $('#filtro-areas');
  [['', 'Todas las áreas'], ...porArea.map(([n]) => [n, areaCorto(n)])].forEach(([v, t]) => {
    const b = el('button', null, null, fa); b.type = 'button'; b.dataset.area = v;
    if (v) { const i = el('i', null, null, b); i.style.background = areaC(v); }
    b.append(t);
    b.addEventListener('click', () => { areaSel = v; progSel = ''; dibujarMapa(); ficha(); });
  });

  function squarify(items, x, y, w, h) {
    const out = []; const total = sum(items, (i) => i.v); if (!total || w <= 0 || h <= 0) return out;
    const k = (w * h) / total;
    let rest = items.filter((i) => i.v > 0).map((i) => ({ i, a: i.v * k }));
    let r = { x, y, w, h };
    const peor = (row, lado) => { const s = sum(row, (q) => q.a); const mx = Math.max(...row.map((q) => q.a)); const mn = Math.min(...row.map((q) => q.a)); return Math.max((lado * lado * mx) / (s * s), (s * s) / (lado * lado * mn)); };
    while (rest.length) {
      const lado = Math.min(r.w, r.h); const row = [rest[0]]; let j = 1;
      while (j < rest.length && peor([...row, rest[j]], lado) <= peor(row, lado)) { row.push(rest[j]); j += 1; }
      const s = sum(row, (q) => q.a);
      if (r.w >= r.h) { const cw = s / r.h; let yy = r.y; row.forEach((q) => { const hh = q.a / cw; out.push({ ...q.i, x0: r.x, y0: yy, x1: r.x + cw, y1: yy + hh }); yy += hh; }); r = { x: r.x + cw, y: r.y, w: r.w - cw, h: r.h }; }
      else { const rh = s / r.w; let xx = r.x; row.forEach((q) => { const ww = q.a / rh; out.push({ ...q.i, x0: xx, y0: r.y, x1: xx + ww, y1: r.y + rh }); xx += ww; }); r = { x: r.x, y: r.y + rh, w: r.w, h: r.h - rh }; }
      rest = rest.slice(j);
    }
    return out;
  }

  function dibujarMapa() {
    $$('#filtro-areas button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === areaSel)));
    const mapa = $('#mapa'); mapa.replaceChildren();
    const W = mapa.clientWidth || 800;
    const lista = [...progs.values()].filter((p) => !areaSel || p.area === areaSel);
    const H = Math.round(W < 600 ? Math.max(520, W * 1.45) : Math.min(640, Math.max(440, W * 0.56)));
    mapa.style.height = H + 'px';
    const grupos = areaSel ? [{ n: areaSel, v: sum(lista, (p) => p.total) }] : porArea.map(([n, v]) => ({ n, v }));
    const elegir = (p) => { progSel = progSel === p.k ? '' : p.k; ocultarGlobo(); dibujarMapa(); ficha(true); };

    // En pantallas angostas, una lista por área se lee mejor que el mapa
    if (W < 600) {
      mapa.style.height = 'auto'; mapa.classList.add('es-lista');
      const maxProg = Math.max(...lista.map((p) => p.total));
      grupos.forEach((g) => {
        const sec = el('div', 'lp-grupo', null, mapa); sec.style.setProperty('--c', areaC(g.n));
        const t = el('div', 'lp-t', null, sec); el('span', null, areaCorto(g.n), t); el('span', 'lp-m', M(g.v), t);
        lista.filter((p) => p.area === g.n).sort((a, b) => b.total - a.total).forEach((p) => {
          const b = el('button', 'lp-item', null, sec); b.type = 'button';
          b.setAttribute('aria-pressed', String(p.k === progSel));
          el('span', 'lp-n', p.programa, b); el('span', 'lp-m', M(p.total), b);
          const bar = el('span', 'lp-bar', null, b); const i = el('i', null, null, bar); i.style.width = (p.total / maxProg) * 100 + '%';
          b.addEventListener('click', () => elegir(p));
        });
      });
      return;
    }
    mapa.classList.remove('es-lista');
    const gap = 3;
    squarify(grupos, 0, 0, W, H).forEach((g) => {
      const gw = g.x1 - g.x0, gh = g.y1 - g.y0;
      const gd = el('div', 'grupo', null, mapa);
      Object.assign(gd.style, { left: g.x0 + 'px', top: g.y0 + 'px', width: gw - gap + 'px', height: gh - gap + 'px' });
      gd.style.setProperty('--c', areaC(g.n));
      const gt = el('div', 'grupo-t', null, gd);
      const cortos = { 'Concejo Deliberante': 'HCD', 'Conducción Superior': 'Conducción', 'Hacienda y Finanzas': 'Hacienda', 'Derechos Humanos': 'DD. HH.' };
      const opciones = [areaCorto(g.n) + ' · ' + M(g.v), areaCorto(g.n), cortos[areaCorto(g.n)] || '', ''];
      for (const o of opciones) { gt.textContent = o; if (gt.scrollWidth <= gt.clientWidth + 1) break; }
      const hijos = lista.filter((p) => p.area === g.n).map((p) => ({ ...p, v: p.total })).sort((a, b) => b.v - a.v);
      squarify(hijos, 0, 28, gw - gap, gh - gap - 28).forEach((p) => {
        const w = p.x1 - p.x0, h = p.y1 - p.y0;
        const b = el('button', 'celda', null, gd); b.type = 'button';
        Object.assign(b.style, { left: p.x0 + 'px', top: p.y0 + 'px', width: Math.max(0, w - 2) + 'px', height: Math.max(0, h - 2) + 'px' });
        b.style.setProperty('--c', areaC(g.n));
        b.style.setProperty('--lineas', String(Math.max(1, Math.min(4, Math.floor((h - 30) / 16)))));
        if (w < 64 || h < 40) b.classList.add('chica');
        b.setAttribute('aria-label', p.programa + ', ' + M(p.total));
        b.setAttribute('aria-pressed', String(p.k === progSel));
        el('span', 'n', p.programa, b);
        if (h > 52) el('span', 'm', M(p.total), b);
        b.addEventListener('pointermove', (e) => mostrarGlobo(e, p.programa, M(p.total) + ' · ' + P(p.total / totGas) + ' del presupuesto'));
        b.addEventListener('pointerleave', ocultarGlobo);
        b.addEventListener('click', () => elegir(p));
      });
    });
  }

  function ficha(desplazar) {
    const f = $('#ficha');
    const p = progs.get(progSel);
    if (!p) { f.hidden = true; return; }
    f.hidden = false; f.style.setProperty('--c', areaC(p.area));
    $('#ficha-area').textContent = p.area;
    $('#ficha-titulo').textContent = p.programa;
    $('#ficha-total').textContent = M(p.total) + ' · ' + P(p.total / totGas) + ' del presupuesto';
    filas($('#ficha-incisos'), groupSum(p.filas, (r) => r.inciso).sort((a, b) => a[0] - b[0]).map(([i, v]) => ({ n: incNom[i], v, c: INC_C[i] })), { total: p.total });
    filas($('#ficha-actividades'), groupSum(p.filas, (r) => r.actividad || 'Conducción y gestión del programa').sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ n, v, c: areaC(p.area) })), { total: p.total });
    filas($('#ficha-fuentes'), groupSum(p.filas, (r) => r.fuente_nombre).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ n, v, c: 'var(--gris)', trama: !n.startsWith('Rentas') })), { total: p.total });
    if (desplazar && f.getBoundingClientRect().top > innerHeight * 0.75) f.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }
  $('#ficha-cerrar').addEventListener('click', () => { progSel = ''; dibujarMapa(); ficha(); });

  let orden = { k: 'total', d: -1 }; let filtroTxt = '';
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function tabla() {
    const tb = $('#tabla-prog tbody'); tb.replaceChildren();
    const lista = [...progs.values()].filter((p) => !filtroTxt || norm(p.programa + ' ' + p.area).includes(norm(filtroTxt)));
    lista.sort((a, b) => (orden.k === 'programa' ? orden.d * a.programa.localeCompare(b.programa) : orden.d * (a[orden.k] - b[orden.k])));
    lista.forEach((p) => {
      const tr = el('tr', null, null, tb); tr.tabIndex = 0;
      const td = el('td', null, p.programa, tr); el('small', null, p.area, td);
      ['personal', 'bys', 'uso', 'transf', 'total'].forEach((k) => el('td', 'num', p[k] ? M(p[k]) : '—', tr));
      const abrir = () => { progSel = p.k; areaSel = ''; dibujarMapa(); ficha(); $('#mapa').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      tr.addEventListener('click', abrir); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') abrir(); });
    });
    if (!lista.length) { const tr = el('tr', null, null, tb); const td = el('td', null, 'No hay programas que coincidan con la búsqueda.', tr); td.colSpan = 6; }
    $$('#tabla-prog th').forEach((th) => th.setAttribute('aria-sort', th.dataset.orden === orden.k ? (orden.d > 0 ? 'ascending' : 'descending') : 'none'));
  }
  $$('#tabla-prog th').forEach((th) => th.addEventListener('click', () => { const k = th.dataset.orden; orden = { k, d: orden.k === k ? -orden.d : (k === 'programa' ? 1 : -1) }; tabla(); }));
  $('#buscar-prog').addEventListener('input', (e) => { filtroTxt = e.target.value; tabla(); });

  /* ---------- qué cambia en 2027 ---------- */
  const CB = window.CAMBIOS;
  function cambios() {
    if (!CB) return;
    const t = CB.total;
    const var26 = t.p2027 / t.b2026_real - 1, var25 = t.p2027 / t.e2025_real - 1;
    const signo = (v) => P(Math.abs(v)) + (v >= 0 ? ' mayor' : ' menor');
    const lect = $('#cambios-lectura'); lect.replaceChildren();
    lect.append('Descontada la inflación, el presupuesto 2027 es ');
    el('strong', null, signo(var26), lect);
    lect.append(' que el presupuesto aprobado para 2026 y ');
    el('strong', null, signo(var25), lect);
    lect.append(' que lo ejecutado en 2025. Abajo, qué cambia en la organización y cómo se reparte entre áreas y tipos de gasto.');

    const dp = $('#dos-presup'); dp.replaceChildren();
    const items = [
      { n: 'Ejecutado en 2025', d: M(t.e2025_nominal) + ' en pesos de 2025', v: t.e2025_real, cls: 'dp-26' },
      { n: 'Presupuesto aprobado 2026', d: M(t.b2026_nominal) + ' en pesos de 2026', v: t.b2026_real, cls: 'dp-cierre' },
      { n: 'Anteproyecto 2027', d: 'Lo que se propone ahora', v: t.p2027, cls: 'dp-27' },
    ];
    const max = Math.max(...items.map((i) => i.v));
    items.forEach((i) => {
      const f = el('div', 'dp ' + i.cls, null, dp);
      const top = el('div', 'dp-top', null, f); el('b', null, i.n, top); el('span', 'dp-v', M(i.v), top);
      const b = el('div', 'dp-bar', null, f); const fi = el('i', null, null, b); fi.style.width = (i.v / max) * 100 + '%';
      el('p', 'dp-d', i.d, f);
    });
    el('p', 'nota', 'Todo en pesos promedio de 2027.', dp);

    // novedades confirmadas por la Secretaría de Hacienda
    const act = (n) => sum(G.filter((g) => g.actividad === n), (g) => g.importe);
    const r22 = ['Residuos urbanos y disposición final', 'Residuos no convencionales', 'Residuos sólidos urbanos y recolección diferenciada'];
    const fe = R.find((r) => r.cod === '11.4.05.00');
    const NOV = [
      { t: 'Se incorpora Defensa Civil', d: 'Es un área que venía funcionando dentro de Seguridad y ahora se institucionaliza como programa aparte, con ' + M(act('Defensa Civil')) + ' para 2027.' },
      { t: 'La recolección de residuos se divide en tres', d: 'Para ver y analizar mejor el costo de cada servicio: ' + r22.map((n) => n.charAt(0).toLowerCase() + n.slice(1) + ' (' + M(act(n)) + ')').join(', ') + '.' },
      fe && { t: 'Fondo Educativo: ' + M(fe.importe), d: 'Viene de la Provincia y solo puede usarse en educación.' },
    ].filter(Boolean);
    const ol = $('#nov-lista'); ol.replaceChildren();
    NOV.forEach((n) => { const li = el('li', null, null, ol); el('b', null, n.t, li); el('p', null, n.d, li); });

    const ad = (cont, filasAD, colorDe) => {
      cont.replaceChildren();
      const mx = Math.max(...filasAD.flatMap((f) => [f.b2026_real, f.p2027]));
      filasAD.filter((f) => f.b2026_real || f.p2027).forEach((f) => {
        const r = el('div', 'ad', null, cont); r.style.setProperty('--c', colorDe(f.nombre));
        const top = el('div', 'ad-top', null, r); el('span', 'ad-n', f.nombre, top);
        const v = f.var_vs_2026;
        if (v != null) el('span', 'ad-var ' + (v >= 0 ? 'sube' : 'baja'), (v >= 0 ? '▲ +' : '▼ −') + P(Math.abs(v)), top);
        const b = el('div', 'ad-bars', null, r);
        const b1 = el('i', 'ad-26', null, b); b1.style.width = (f.b2026_real / mx) * 100 + '%';
        const b2 = el('i', 'ad-27', null, b); b2.style.width = (f.p2027 / mx) * 100 + '%';
        el('p', 'ad-m', M(f.b2026_real) + ' → ' + M(f.p2027), r);
      });
    };
    ad($('#cmp-areas'), [...CB.areas].sort((a, b) => b.p2027 - a.p2027).map((a) => ({ ...a, nombre: areaCorto(a.nombre) })), (n) => areaC(Object.keys(AREA).find((k) => areaCorto(k) === n)));
    ad($('#cmp-incisos'), CB.incisos, (n) => INC_C[Object.values(incNom).indexOf(n) + 1] || 'var(--azul)');
  }
  cambios();

  /* ---------- ¿qué paga mi tasa? ---------- */
  const TASAS = [
    { n: 'Servicios rurales', quien: 'Los propietarios de campos, por hectárea.', que: 'Conservación, reparación y mejorado de los caminos rurales.', cods: ['12.1.03.01', '12.1.03.02'] },
    { n: 'Alumbrado público', quien: 'Todos los inmuebles del partido.', que: 'El alumbrado de calles y espacios públicos.', cods: ['12.1.01.03'] },
    { n: 'Servicios sanitarios', quien: 'Los inmuebles conectados a la red.', que: 'Agua corriente y cloacas, conexiones y reparaciones.', cods: ['12.1.15.01', '12.1.15.02', '12.1.15.03'] },
    { n: 'Servicios urbanos', quien: 'Las propiedades urbanas, por metro de frente.', que: 'Barrido, limpieza, riego, plazas, espacios verdes y poda.', cods: ['12.1.01.01', '12.1.01.02'] },
    { n: 'Tasa vial urbana', quien: 'Quien carga combustible en estaciones del partido.', que: 'Señalización, reparación y mejora de las calles.', cods: ['12.1.17.01'] },
    { n: 'Seguridad e higiene', quien: 'Comercios, industrias y servicios, según sus ingresos.', que: 'Inspección de seguridad, higiene y ambiente de las actividades económicas.', cods: ['12.1.05.01', '12.1.05.02'] },
    { n: 'Marcas y señales', quien: 'Productores ganaderos.', que: 'Control y registro de marcas y señales del ganado.', cods: ['12.1.16.01'] },
    { n: 'Fortalecimiento de la seguridad', quien: 'Los contribuyentes de la tasa de servicios urbanos.', que: 'Seguridad pública.', cods: ['12.1.01.04'] },
    { n: 'Prevención zoonótica', quien: 'Los contribuyentes de la tasa de servicios sanitarios.', que: 'Control de la población canina y felina: castraciones y vacunación.', cods: ['12.1.15.04'] },
    { n: 'Red de tránsito pesado', quien: 'Usuarios de la red de tránsito pesado.', que: 'Mantenimiento de las calles por donde circulan camiones.', cods: ['12.1.22.00'] },
    { n: 'Bomberos voluntarios', quien: 'Se cobra junto con las tasas.', que: 'Aporte al cuerpo de Bomberos Voluntarios.', cods: ['12.1.03.05'] },
  ];
  (function tasas() {
    const cont = $('#lista-tasas');
    const items = TASAS.map((t) => { const rs = R.filter((r) => t.cods.includes(r.cod)); return { ...t, v: sum(rs, (r) => r.importe), fijo: rs.some((r) => r.afectado) }; }).filter((t) => t.v > 0).sort((x, y) => y.v - x.v);
    const max = Math.max(...items.map((t) => t.v));
    items.forEach((t) => {
      const art = el('article', 'tasa', null, cont);
      const cab = el('div', 'tasa-cab', null, art);
      el('h3', null, t.n, cab);
      el('span', 'tasa-uso ' + (t.fijo ? 'fijo' : 'libre'), t.fijo ? 'Destino fijo' : 'Libre uso', cab);
      const m = el('p', 'tasa-m', null, art); el('b', null, M(t.v), m); m.append(' en 2027 · ' + '$' + nf0.format(Math.round(t.v / POBLACION)) + ' por habitante');
      const b = el('div', 'tasa-bar' + (t.fijo ? ' trama' : ''), null, art); b.style.width = (t.v / max) * 100 + '%';
      const dl = el('dl', null, null, art);
      el('dt', null, 'Quién la paga', dl); el('dd', null, t.quien, dl);
      el('dt', null, 'Qué cubre', dl); el('dd', null, t.que, dl);
    });
  })();

  /* ---------- frente a otros municipios ---------- */
  (function municipios() {
    const MU = window.MUNICIPIOS; if (!MU) return;
    const cont = $('#indicadores');
    MU.indicadores.forEach((i) => {
      const art = el('article', 'ind', null, cont);
      el('h3', null, i.n, art);
      el('p', 'ind-d', i.d, art);
      const max = Math.max(i.local2024, i.provincia2024, i.local2027 || 0) * 1.15;
      const fila = (cls, n, v) => { const f = el('div', 'ind-f ' + cls, null, art); el('span', 'ind-n', n, f); const t = el('span', 'ind-t', null, f); const b = el('i', null, null, t); b.style.width = (v / max) * 100 + '%'; el('b', 'ind-v', P(v), f); };
      fila('ki-cda', 'Carmen de Areco 2024', i.local2024);
      fila('ki-prov', 'Provincia 2024', i.provincia2024);
      if (i.local2027 != null) fila('ki-27', 'Presupuesto 2027', i.local2027);
    });
  })();

  /* ---------- cómo va 2027 ---------- */
  (function seguimiento() {
    const E = window.EJECUCION; const lect = $('#seg-lectura'); const cont = $('#seg-contenido');
    if (!E || !E.disponible) {
      lect.textContent = 'Esta sección va a mostrar, cada trimestre, cuánto del presupuesto ya se gastó y cuánto se recaudó.';
      const av = el('div', 'seg-vacio', null, cont);
      el('b', null, 'Primer informe: ' + (E ? E.proximo : 'abril de 2027'), av);
      el('p', null, 'Con datos al ' + (E ? E.corte : '31 de marzo de 2027') + ', a partir de la ejecución que el municipio informa en SIMCO.', av);
      return;
    }
    lect.textContent = 'Datos a ' + E.corte + '. Transcurrió ' + P(E.avance_tiempo) + ' del año.';
    const f = (n, ej, pr, extra) => { const d = el('div', 'seg-f', null, cont); const top = el('div', 'fila-top', null, d); el('span', 'l', n, top); el('span', 'v', P(ej / pr) + ' · ' + M(ej) + ' de ' + M(pr), top); const b = el('div', 'seg-b', null, d); const i = el('i', null, null, b); i.style.width = Math.min(100, (ej / pr) * 100) + '%'; const mk = el('span', 'seg-hoy', null, b); mk.style.left = E.avance_tiempo * 100 + '%'; if (extra) el('p', 'sub', extra, d); };
    f('Gasto total', E.gasto.ejecutado, E.gasto.presupuesto);
    f('Recursos percibidos', E.recursos.percibido, E.recursos.presupuesto);
    E.areas.filter((x) => x.presupuesto).forEach((x) => f(areaCorto(x.nombre), x.ejecutado, x.presupuesto));
    el('p', 'nota', 'La línea vertical marca la parte del año transcurrida.', cont);
  })();

  /* ---------- evolución en pesos de 2027 ---------- */
  const SERIES = {
    gasto: { n: 'el gasto total', f: (r, real) => r[real ? 'gasto_real' : 'gasto_nominal'] },
    recursos: { n: 'los recursos', pl: true, f: (r, real) => r[real ? 'recursos_real' : 'recursos_nominal'] },
    i1: { n: 'el gasto en personal', f: (r, real) => r['inciso_1_' + (real ? 'real' : 'nominal')] },
    i23: { n: 'el gasto en bienes y servicios', f: (r, real) => r['inciso_2_' + (real ? 'real' : 'nominal')] + r['inciso_3_' + (real ? 'real' : 'nominal')] },
    i4: { n: 'el gasto en obras y equipamiento', f: (r, real) => r['inciso_4_' + (real ? 'real' : 'nominal')] },
    i5: { n: 'las transferencias', pl: true, f2: true, f: (r, real) => r['inciso_5_' + (real ? 'real' : 'nominal')] },
  };
  let serie = 'gasto';
  const nominal = $('#evo-nominal');
  $$('#evo-serie button').forEach((b) => b.addEventListener('click', () => { serie = b.dataset.serie; evolucion(); }));
  nominal.addEventListener('change', () => evolucion());
  const porHabEl = $('#evo-hab'); porHabEl.addEventListener('change', () => evolucion());
  // Población por año: crecimiento geométrico entre los censos 2010 (14.692) y 2022 (17.499), proyectado igual hasta 2027
  const TASA_POB = Math.pow(17499 / 14692, 1 / 12) - 1;
  const poblacion = (anio) => 17499 * Math.pow(1 + TASA_POB, anio - 2022);

  function evolucion() {
    $$('#evo-serie button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.serie === serie)));
    const real = !nominal.checked;
    const def = SERIES[serie];
    const ph = porHabEl.checked;
    const datos = S.filas.map((r) => ({ anio: r.anio, tipo: r.tipo, v: def.f(r, real) / (ph ? poblacion(r.anio) : 1) }));
    const MF = (v) => (ph ? '$' + nf0.format(Math.round(v)) : M(v));
    const cont = $('#evo-grafico');
    const W = Math.max(300, cont.clientWidth || 800);
    const H = W < 600 ? 330 : 410;
    const m = { t: 62, r: 4, b: 30, l: 4 };
    const max = Math.max(...datos.map((d) => d.v)) * 1.08;
    const n = datos.length; const paso = (W - m.l - m.r) / n; const ancho = Math.min(68, paso * 0.68);
    const yv = (v) => m.t + (H - m.t - m.b) * (1 - v / max);
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (t, a, p) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (p) p.append(e); return e; };
    let svg = cont.querySelector('svg');
    const nuevo = !svg;
    if (nuevo) { svg = sv('svg', {}, cont); }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Columnas por año, de 2019 a 2027, ' + (real ? 'en pesos de 2027' : 'en pesos de cada año') + ': ' + datos.map((d) => d.anio + ' ' + M(d.v)).join('; '));
    svg.replaceChildren();
    const defs = sv('defs', {}, svg);
    const pat = sv('pattern', { id: 'rayado', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    sv('rect', { width: 6, height: 6, fill: '#5E7FAE' }, pat);
    sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: css('--oscuro'), 'stroke-width': 2.2 }, pat);
    [0.25, 0.5, 0.75].forEach((f) => sv('line', { class: 'rej', x1: 0, x2: W, y1: yv(max / 1.08 * f), y2: yv(max / 1.08 * f) }, svg));
    sv('line', { class: 'rej', x1: 0, x2: W, y1: yv(0), y2: yv(0) }, svg);
    // Períodos de contexto: franja detrás de las columnas, con su nombre arriba
    const PERIODOS = [
      { desde: 2020, hasta: 2021, n: 'Pandemia de COVID-19', corto: 'COVID-19' },
      { desde: 2024, hasta: 2027, n: 'Gobierno nacional de Javier Milei', corto: 'Gob. Milei' },
    ];
    PERIODOS.forEach((p) => {
      const i0 = datos.findIndex((x) => x.anio === p.desde), i1 = datos.findIndex((x) => x.anio === p.hasta);
      if (i0 < 0 || i1 < 0) return;
      const x0 = m.l + paso * i0 + 3, x1 = m.l + paso * (i1 + 1) - 3;
      sv('rect', { class: 'periodo', x: x0, y: m.t - 30, width: x1 - x0, height: yv(0) - (m.t - 30), rx: 6 }, svg);
      const t = sv('text', { class: 'periodo-t', x: x0 + 9, y: m.t - 12 }, svg);
      t.textContent = p.n;
      if (t.getComputedTextLength() > x1 - x0 - 14) t.textContent = p.corto;
    });
    datos.forEach((d, i) => {
      const cx = m.l + paso * i + paso / 2; const x = cx - ancho / 2;
      const fill = d.tipo === 'presupuesto' ? '#4FC3E6' : d.tipo === 'presupuesto_2026' ? 'url(#rayado)' : '#5E7FAE';
      const col = sv('rect', { class: 'col', x, width: ancho, y: yv(d.v), height: Math.max(0, yv(0) - yv(d.v)), rx: 3, fill }, svg);
      col.addEventListener('pointermove', (e) => mostrarGlobo(e, String(d.anio) + (d.tipo === 'presupuesto_2026' ? ' (presupuesto aprobado)' : d.tipo === 'presupuesto' ? ' (presupuesto)' : ''), MF(d.v) + (ph ? ' por habitante' : '') + (real ? ' en pesos de 2027' : ' en pesos de ese año')));
      col.addEventListener('pointerleave', ocultarGlobo);
      const val = sv('text', { class: 'val', x: cx, y: yv(d.v) - 8, 'text-anchor': 'middle' }, svg);
      const mm = d.v / 1e6;
      const corto = W < 640;
      val.textContent = ph ? nf0.format(d.v / 1000) : (corto ? nf1.format(mm / 1000) : nf0.format(mm));
      if (corto) val.setAttribute('font-size', '11.5');
      const an = sv('text', { class: 'anio', x: cx, y: H - 8, 'text-anchor': 'middle' }, svg); an.textContent = W < 420 ? "'" + String(d.anio).slice(2) : d.anio;
    });
    const u = sv('text', { x: 0, y: 12 }, svg);
    u.textContent = ph ? 'Miles de pesos por habitante' + (real ? ', en pesos de 2027' : ', de cada año') : (W < 640 ? 'Miles de millones' : 'Millones') + (real ? ' de pesos de 2027' : ' de pesos de cada año');

    // lectura
    const v27 = datos.find((d) => d.anio === 2027).v; const v26 = datos.find((d) => d.anio === 2026).v; const v25 = datos.find((d) => d.anio === 2025).v;
    const pico = datos.filter((d) => d.anio < 2027).reduce((a, b) => (b.v > a.v ? b : a));
    const lect = $('#evo-lectura'); lect.replaceChildren();
    const pl = def.pl;
    const cambio = (a, b) => { const x = a / b - 1; return P(Math.abs(x)) + (x >= 0 ? (pl ? ' mayores' : ' mayor') : (pl ? ' menores' : ' menor')); };
    if (real) {
      const nombre = def.n;
      lect.append('Descontada la inflación, ' + nombre + ' previst' + (pl ? (def.f2 ? 'as' : 'os') : 'o') + ' para 2027 ' + (pl ? 'son ' : 'es '));
      el('strong', null, cambio(v27, v26), lect);
      lect.append(' que el presupuesto aprobado para 2026 y ');
      el('strong', null, cambio(v27, v25), lect);
      lect.append(' que lo ejecutado en 2025. El año más alto de la serie fue ' + pico.anio + ', con ' + MF(pico.v) + (ph ? ' por habitante' : '') + ' en pesos de 2027.');
    } else {
      lect.append('En pesos de cada año los montos parecen crecer siempre: de ' + MF(datos[0].v) + ' en 2019 a ' + MF(v27) + ' en 2027. Es casi todo inflación. ');
      el('strong', null, 'Desactivá el interruptor para ver la comparación real.', lect);
    }
  }

  /* ---------- personal ---------- */
  const persArea = new Map();
  G.filter((r) => r.inciso === 1).forEach((r) => { const a = persArea.get(r.jurisdiccion) || { n: r.jurisdiccion, costo: 0, perm: 0, temp: 0 }; a.costo += r.importe; persArea.set(r.jurisdiccion, a); });
  C.forEach((c) => { const a = persArea.get(c.jurisdiccion); if (a) a[c.tipo === 'permanente' ? 'perm' : 'temp'] += c.cargos; });
  const totPerm = sum(C.filter((c) => c.tipo === 'permanente'), (c) => c.cargos); const totTemp = sum(C.filter((c) => c.tipo !== 'permanente'), (c) => c.cargos);
  $('#personal-lectura').textContent = 'El presupuesto prevé ' + nf0.format(totPerm) + ' cargos permanentes y ' + nf0.format(totTemp) + ' temporarios. El personal se lleva ' + P(pers / totGas) + ' del gasto, ' + M(pers) + ' en el año.';
  const gente = $('#gente');
  [...persArea.values()].sort((a, b) => b.perm + b.temp - (a.perm + a.temp)).forEach((a) => {
    const box = el('div', 'area-g', null, gente);
    const h = el('header', null, null, box);
    el('b', null, areaCorto(a.n), h);
    el('span', null, nf0.format(a.perm + a.temp) + ' cargos · ' + M(a.costo), h);
    const pts = el('div', 'puntos', null, box); pts.style.setProperty('--c', areaC(a.n));
    pts.setAttribute('role', 'img'); pts.setAttribute('aria-label', a.perm + ' permanentes y ' + a.temp + ' temporarios');
    for (let i = 0; i < a.perm; i++) el('i', null, null, pts);
    for (let i = 0; i < a.temp; i++) el('i', 't', null, pts);
  });
  const deuda = groupSum(G.filter((r) => r.inciso === 7), (r) => r.programa);
  const dTot = sum(deuda, (d) => d[1]);
  $('#deuda-txt').textContent = 'Se destinan ' + M(dTot) + ' a deuda, ' + P(dTot / totGas) + ' del presupuesto. ' + deuda.sort((a, b) => b[1] - a[1]).map(([n, v]) => n + ': ' + M(v)).join('. ') + '. La deuda flotante son pagos pendientes a proveedores de ejercicios anteriores; la consolidada corresponde al régimen de desendeudamiento del Decreto 259/12.';

  /* ---------- índice activo ---------- */
  const enlaces = $$('.indice a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) enlaces.forEach((a) => { const on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('activo', on); if (on) { const nav = a.parentElement; nav.scrollTo({ left: Math.max(0, a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2), behavior: 'smooth' }); } });
    }), { rootMargin: '-35% 0px -60% 0px' });
    ['calculadora', 'recursos', 'tasas', 'recorrido', 'gastos', 'programas', 'cambios', 'evolucion', 'municipios', 'seguimiento', 'personal', 'datos'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  const btnImp = $('#imprimir'); if (btnImp) btnImp.addEventListener('click', () => window.print());

  /* ---------- dibujo inicial y al cambiar el ancho ---------- */
  function todo() { recorrido(); dibujarMapa(); ficha(); tabla(); evolucion(); }
  todo();
  let anchoPrevio = innerWidth; let t;
  addEventListener('resize', () => { if (Math.abs(innerWidth - anchoPrevio) < 8) return; anchoPrevio = innerWidth; clearTimeout(t); t = setTimeout(() => { recorrido(); dibujarMapa(); evolucion(); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => dibujarMapa());
})();
