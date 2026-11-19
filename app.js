/* Presupuesto 2027 · Carmen de Areco
   Sin dependencias externas. Datos: datos/datos.js (presupuesto 2027) y datos/serie.js (serie en pesos de 2027),
   generados por 11_Tablero/generar_datos.py y 11_Tablero/generar_serie_real.py. */
(function () {
  'use strict';
  const D = window.PRESUPUESTO;
  const S = window.SERIE_REAL;
  if (!D || !S) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p style="padding:20px;background:#fee">No se pudieron cargar los datos del presupuesto.</p>',
    );
    return;
  }

  /* ---------- formato ---------- */
  const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const M = (v) => {
    const m = v / 1e6;
    if (Math.abs(m) < 0.95) return '$' + nf0.format(v / 1000) + ' mil';
    return '$' + (Math.abs(m) >= 100 ? nf0 : nf1).format(m) + ' M';
  };
  const P = (v) => nf1.format(v * 100) + '%';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, txt, parent) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    if (parent) parent.append(e);
    return e;
  };
  // Movimiento: se respeta "reducir movimiento" del sistema; ?animar en la dirección lo fuerza para revisar
  const MOV =
    !matchMedia('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(location.search).has('animar');
  function tween(e, desde, hasta, fmt, dur = 900) {
    if (!MOV) {
      e.textContent = fmt(hasta);
      return;
    }
    const id = (e._tw || 0) + 1;
    e._tw = id;
    const t0 = performance.now();
    const paso = (t) => {
      if (e._tw !== id) return;
      const p = Math.min(1, (t - t0) / dur);
      const k = 1 - Math.pow(1 - p, 3);
      e.textContent = fmt(desde + (hasta - desde) * k);
      if (p < 1) requestAnimationFrame(paso);
      else e.textContent = fmt(hasta);
    };
    requestAnimationFrame(paso);
    setTimeout(() => {
      if (e._tw === id) e.textContent = fmt(hasta);
    }, dur + 400);
  }
  const ico = (name, parent, cls) => {
    const i = document.createElement('i');
    i.dataset.lucide = name;
    i.setAttribute('aria-hidden', 'true');
    if (cls) i.className = cls;
    parent.prepend(i);
    return i;
  };
  const iconos = () => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
  };
  const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);
  const groupSum = (rows, key, val = (r) => r.importe) => {
    const m = new Map();
    rows.forEach((r) => {
      const k = key(r);
      m.set(k, (m.get(k) || 0) + val(r));
    });
    return [...m.entries()];
  };
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
  const INC_C = [
    '',
    'var(--azul)',
    'var(--turquesa)',
    'var(--agua)',
    'var(--verde)',
    'var(--lima)',
    'var(--gris)',
    'var(--marino)',
  ];

  /* Destinos del ticket: funciones del clasificador agrupadas en lenguaje llano */
  const DESTINOS = [
    {
      n: 'Obras, calles y caminos',
      icon: 'construction',
      f: ['Planeamiento y desarrollo urbano'],
      c: 'var(--azul)',
    },
    {
      n: 'Limpieza, residuos y espacios verdes',
      icon: 'recycle',
      f: [
        'Recolección de residuos, barrido y limpieza',
        'Otros servivicios urbanos',
        'Ecología y medio ambiente',
      ],
      c: 'var(--agua)',
    },
    {
      n: 'Administración y recaudación',
      icon: 'landmark',
      f: ['Administración Fiscal'],
      c: 'var(--gris)',
    },
    {
      n: 'Educación',
      icon: 'graduation-cap',
      f: ['Educación elemental', 'Educación superior y universitaria'],
      c: 'var(--turquesa)',
    },
    { n: 'Salud', icon: 'heart-pulse', f: ['Salud'], c: 'var(--verde)' },
    { n: 'Seguridad y tránsito', icon: 'shield', f: ['Seguridad interior'], c: 'var(--marino)' },
    {
      n: 'Acción social, niñez y juventud',
      icon: 'hand-heart',
      f: ['Promoción y asistencia social'],
      c: 'var(--lima)',
    },
    {
      n: 'Gobierno, inspección y comunicación',
      icon: 'megaphone',
      f: ['Dirección superior ejecutiva', 'Judicial', 'Información y estadísticas básicas'],
      c: 'var(--gris)',
    },
    {
      n: 'Turismo, cultura y deporte',
      icon: 'trophy',
      f: ['Comercio, turismo y otros servicios', 'Cultura (incluye culto)', 'Deporte y recreación'],
      c: 'var(--verde)',
    },
    { n: 'Alumbrado público', icon: 'lamp', f: ['Alumbrado público'], c: 'var(--lima)' },
    {
      n: 'Agua y cloacas',
      icon: 'droplets',
      f: ['Agua potable y alcantarillado'],
      c: 'var(--turquesa)',
    },
    { n: 'Concejo Deliberante', icon: 'gavel', f: ['Legislativa'], c: 'var(--gris)' },
    {
      n: 'Deuda',
      icon: 'banknote',
      f: ['Servicios de la deuda pública (intereses y'],
      c: 'var(--marino)',
    },
    { n: 'Cementerio', icon: 'flower-2', f: ['Cementerios'], c: 'var(--agua)' },
  ];

  /* ---------- totales ---------- */
  const R = D.recursos,
    G = D.gastos,
    C = D.cargos;
  const totRec = sum(R, (r) => r.importe);
  const totGas = sum(G, (r) => r.importe);
  const prov = sum(
    R.filter((r) => r.origen === 'Provincial'),
    (r) => r.importe,
  );
  const mun = sum(
    R.filter((r) => r.origen === 'Municipal'),
    (r) => r.importe,
  );
  const afec = sum(
    R.filter((r) => r.afectado),
    (r) => r.importe,
  );
  const pers = sum(
    G.filter((r) => r.inciso === 1),
    (r) => r.importe,
  );
  const porArea = groupSum(G, (r) => r.jurisdiccion).sort((a, b) => b[1] - a[1]);
  // Censo Nacional de Población 2022 (INDEC), resultados definitivos, partido de Carmen de Areco
  const POBLACION = 17499;
  const pesos = (v) => '$' + nf0.format(Math.round(v));
  const valores = {
    apaca: M(
      sum(
        G.filter((r) => r.actividad === 'Mantenimiento de caminos' && r.inciso === 5),
        (r) => r.importe,
      ),
    ),
    por_hab: pesos(totGas / POBLACION),
    por_hab_mes: pesos(totGas / POBLACION / 12),
    rec_mun_hab: pesos(mun / POBLACION),
    poblacion: nf0.format(POBLACION),
    total: M(totGas),
    pct_prov: P(prov / totRec),
    pct_mun: P(mun / totRec),
    pct_afec: P(afec / totRec),
    pct_personal: P(pers / totGas),
    jur_top: 'La Secretaría de ' + areaCorto(porArea[0][0]),
    jur_top_pct: P(porArea[0][1] / totGas),
  };
  $$('[data-v]').forEach((e) => {
    e.textContent = valores[e.dataset.v] ?? '—';
  });

  /* ---------- globo ---------- */
  const globo = $('#globo');
  function mostrarGlobo(ev, titulo, texto) {
    globo.replaceChildren();
    el('b', null, titulo, globo);
    el('span', null, texto, globo);
    globo.hidden = false;
    const w = globo.offsetWidth,
      h = globo.offsetHeight;
    let x = ev.clientX + 14,
      y = ev.clientY + 16;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 14;
    if (y + h > innerHeight - 8) y = ev.clientY - h - 14;
    globo.style.left = Math.max(8, x) + 'px';
    globo.style.top = Math.max(8, y) + 'px';
  }
  const ocultarGlobo = () => {
    globo.hidden = true;
  };

  /* ---------- filas con barra ---------- */
  function filas(cont, items, o = {}) {
    cont.replaceChildren();
    const max = Math.max(...items.map((i) => i.v));
    items.forEach((it) => {
      const f = el('div', 'fila', null, cont);
      const top = el('div', 'fila-top', null, f);
      el('span', 'l', it.n, top);
      const v = el('span', 'v', null, top);
      el('span', 'vm', M(it.v), v);
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
  const destinos = DESTINOS.map((d) => ({ ...d, v: sum(d.f, (f) => porFuncion.get(f) || 0) }))
    .filter((d) => d.v > 0)
    .sort((a, b) => b.v - a.v);
  const sinAsignar = totGas - sum(destinos, (d) => d.v);
  if (Math.abs(sinAsignar) > 1e6) destinos.push({ n: 'Otros', v: sinAsignar, c: 'var(--gris)' });
  const inMonto = $('#monto');
  const leerMonto = () => {
    const n = Number(String(inMonto.value).replace(/[^\d]/g, ''));
    return Number.isFinite(n) ? Math.min(n, 1e12) : 0;
  };
  let previos = [];
  function ticket(desdeCero) {
    const monto = leerMonto();
    const brutos = destinos.map((d) => (monto * d.v) / totGas);
    const base = brutos.map(Math.floor);
    let resto = Math.round(monto - sum(base, (x) => x));
    brutos
      .map((b, i) => [b - base[i], i])
      .sort((a, b) => b[0] - a[0])
      .forEach(([, i]) => {
        if (resto > 0) {
          base[i] += 1;
          resto -= 1;
        }
      });
    const ol = $('#ticket-lineas');
    const pesosF = (x) => '$' + nf0.format(Math.round(x));
    if (!ol.children.length) {
      destinos.forEach((d) => {
        const li = el('li', null, null, ol);
        const c = el('i', 'c', null, li);
        c.dataset.lucide = d.icon || 'circle';
        c.setAttribute('aria-hidden', 'true');
        c.style.color = d.c;
        const n = el('span', 'n', null, li);
        el('span', null, d.n, n);
        el('span', 'v', '$0', li);
      });
      iconos();
    }
    $$('#ticket-lineas .v').forEach((v, i) =>
      tween(v, desdeCero ? 0 : previos[i] || 0, base[i], pesosF, desdeCero ? 1300 + i * 60 : 450),
    );
    tween(
      $('#ticket-total'),
      desdeCero ? 0 : previos.total || 0,
      monto,
      pesosF,
      desdeCero ? 1300 : 450,
    );
    previos = base.slice();
    previos.total = monto;
    $$('.ticket-rapido button').forEach((b) =>
      b.classList.toggle(
        'activo',
        b.hasAttribute('data-hab')
          ? monto === Math.round(totGas / POBLACION)
          : Number(b.dataset.monto) === monto,
      ),
    );
  }
  inMonto.addEventListener('input', () => {
    const n = leerMonto();
    const pos = inMonto.value.length - inMonto.selectionStart;
    inMonto.value = n ? nf0.format(n) : '';
    const p = Math.max(0, inMonto.value.length - pos);
    inMonto.setSelectionRange(p, p);
    ticket(false);
  });
  $$('.ticket-rapido button').forEach((b) =>
    b.addEventListener('click', () => {
      inMonto.value = nf0.format(
        b.hasAttribute('data-hab') ? Math.round(totGas / POBLACION) : Number(b.dataset.monto),
      );
      ticket(true);
    }),
  );
  $('#ticket').addEventListener('submit', (e) => e.preventDefault());
  ticket(true);

  /* ---------- recursos ---------- */
  // Grupos en lenguaje llano, por código de recurso (clasificador RAFAM)
  const GRUPOS_REC = [
    {
      lado: 'prov',
      n: 'Coparticipación',
      d: 'La parte de los impuestos provinciales que le corresponde a los municipios.',
      t: (c) => c === '11.4.01.00',
    },
    {
      lado: 'prov',
      n: 'Fondo Educativo',
      d: 'Solo puede usarse en educación.',
      t: (c) => c === '11.4.05.00',
    },
    {
      lado: 'prov',
      n: 'Impuestos provinciales compartidos',
      d: 'Inmobiliario rural, automotor, ingresos brutos, juegos de azar y el 6 % de la energía eléctrica.',
      t: (c) => c.startsWith('11.9'),
    },
    {
      lado: 'prov',
      n: 'Otros fondos provinciales',
      d: 'Fortalecimiento de recursos, inclusión social y Fondo de Inversión Municipal.',
      t: (c) => ['11.4.02.00', '11.4.03.00', '17.5.01.67'].includes(c),
    },
    {
      lado: 'prov',
      n: 'Programas y convenios',
      d: 'Policía comunal, Casa del Niño, Casa de Abrigo, Juegos Bonaerenses, Envión y otros.',
      t: (c) => c.startsWith('17.5'),
    },
    {
      lado: 'mun',
      n: 'Servicios rurales',
      d: 'La tasa por el mantenimiento de los caminos rurales.',
      t: (c) => c.startsWith('12.1.03.0') && c !== '12.1.03.05',
    },
    {
      lado: 'mun',
      n: 'Tasas por servicios urbanos',
      d: 'Alumbrado, barrido y limpieza, servicios sanitarios, tasa vial urbana, seguridad, zoonosis y bomberos.',
      t: (c) =>
        ['12.1.01', '12.1.02', '12.1.15', '12.1.17', '12.1.22', '12.1.03.05'].some((x) =>
          c.startsWith(x),
        ),
    },
    {
      lado: 'mun',
      n: 'Multas',
      d: 'Tránsito y seguridad vial, infracciones fiscales y normativas.',
      t: (c) => c.startsWith('12.6') || c === '12.9.06.00',
    },
    {
      lado: 'mun',
      n: 'Comercios e industrias',
      d: 'Inspección de seguridad e higiene y habilitaciones.',
      t: (c) => c.startsWith('12.1.05') || c.startsWith('12.1.04'),
    },
    {
      lado: 'mun',
      n: 'Derechos y otros ingresos',
      d: 'Construcción, oficina, uso del espacio público, cementerio, marcas y señales, balneario, intereses y recuperos.',
      t: () => true,
    },
  ];
  const ladoDe = (r) =>
    r.origen === 'Provincial' ? 'prov' : r.origen === 'Municipal' ? 'mun' : 'otro';
  const grupoDe = (r) => GRUPOS_REC.find((g) => g.lado === ladoDe(r) && g.t(r.cod));
  const LADOS = [
    {
      k: 'prov',
      n: 'La Provincia',
      etq: 'De la Provincia le corresponden a Carmen de Areco',
      c: 'var(--turquesa)',
    },
    { k: 'mun', n: 'Vecinos y empresas', etq: 'Vecinos y empresas contribuyen', c: 'var(--azul)' },
  ];
  // de cada $100, con método del mayor resto para que sume 100
  const cienDe = (vals) => {
    const b = vals.map((v) => Math.floor((v / totRec) * 100));
    let f = 100 - sum(b, (x) => x);
    vals
      .map((v, i) => [(v / totRec) * 100 - b[i], i])
      .sort((x, y) => y[0] - x[0])
      .forEach(([, i]) => {
        if (f > 0) {
          b[i] += 1;
          f -= 1;
        }
      });
    return b;
  };
  const totLado = LADOS.map((l) =>
    sum(
      R.filter((r) => ladoDe(r) === l.k),
      (r) => r.importe,
    ),
  );
  const otros = sum(
    R.filter((r) => ladoDe(r) === 'otro'),
    (r) => r.importe,
  );
  const cien = cienDe([...totLado, otros]);
  const barra = $('#cien');
  barra.setAttribute(
    'aria-label',
    'De cada 100 pesos: ' + LADOS.map((l, i) => cien[i] + ' los aporta ' + l.n).join(', '),
  );
  LADOS.forEach((l, i) => {
    const s = el('div', null, null, barra);
    s.style.flex = String(totLado[i]);
    s.style.background = l.c;
    el('span', null, '$' + cien[i], s);
  });
  const quienes = $('#quienes');
  LADOS.forEach((l, i) => {
    const col = el('div', 'quien', null, quienes);
    col.style.setProperty('--c', l.c);
    const cab = el('div', 'quien-cab', null, col);
    const qn = el('p', 'quien-n', null, cab);
    ico(l.k === 'prov' ? 'landmark' : 'users', qn, 'ico-in');
    qn.append(l.etq);
    const big = el('p', 'quien-cien', null, cab);
    el('b', null, '$' + cien[i], big);
    big.append(' de cada $100');
    el('p', 'quien-m', M(totLado[i]) + ' en el año', cab);
    const items = GRUPOS_REC.filter((g) => g.lado === l.k)
      .map((g) => ({
        g,
        v: sum(
          R.filter((r) => ladoDe(r) === l.k && grupoDe(r) === g),
          (r) => r.importe,
        ),
      }))
      .filter((x) => x.v > 0)
      .sort((a, b) => b.v - a.v);
    const max = Math.max(...items.map((x) => x.v));
    const ul = el('ul', 'quien-lista', null, col);
    items.forEach(({ g, v }) => {
      const li = el('li', null, null, ul);
      const top = el('div', 'ql-top', null, li);
      el('span', 'ql-n', g.n, top);
      el('span', 'ql-v', M(v), top);
      const b = el('div', 'ql-bar', null, li);
      const fi = el('i', null, null, b);
      fi.style.width = (v / max) * 100 + '%';
      el('p', 'ql-d', g.d, li);
    });
  });
  if (otros)
    $('#otros-origen').textContent =
      'Además, ' +
      M(otros) +
      ' provienen de otros recursos destinados al Hábitat y Banco de Tierras.';

  const fijo = afec,
    libre = totRec - afec;
  $('#pct-libre').textContent = '$' + Math.round((libre / totRec) * 100) + ' de cada $100';
  $('#pct-fijo').textContent = '$' + (100 - Math.round((libre / totRec) * 100)) + ' de cada $100';
  const db = $('#destino-barra');
  db.setAttribute(
    'aria-label',
    P(libre / totRec) + ' de libre uso y ' + P(fijo / totRec) + ' con destino fijo',
  );
  [
    [libre, 'Libre uso', ''],
    [fijo, 'Destino fijo', 'trama'],
  ].forEach(([v, n, cls]) => {
    const s = el('div', cls, null, db);
    s.style.flex = String(v);
    const sp = el('span', null, n, s);
    if (sp.scrollWidth > sp.clientWidth + 1)
      sp.textContent = n === 'Destino fijo' ? 'Fijo' : 'Libre';
  });
  const EJ = {
    '11.4.05.00': 'el Fondo Educativo, en educación',
    '12.1.01.03': 'la tasa de alumbrado, en alumbrado público',
    '12.1.17.01': 'la tasa vial urbana, en calles',
    '17.5.01.13': 'Casa de Abrigo, en niñez y adolescencia',
    '17.5.01.01': 'el convenio de Policía Comunal, en seguridad',
  };
  const ej = $('#ejemplos-fijo');
  R.filter((r) => EJ[r.cod])
    .sort((a, b) => b.importe - a.importe)
    .forEach((r) => {
      const li = el('li', null, null, ej);
      li.append(EJ[r.cod].charAt(0).toUpperCase() + EJ[r.cod].slice(1) + ': ');
      el('b', null, M(r.importe), li);
    });

  let filtroRec = '';
  const nombreLlano = (s) =>
    s
      .replace(/\s+/g, ' ')
      .replace(' ,', ',')
      .replace(/\s*-\s*$/, '');
  function tablaRec() {
    const tb = $('#tabla-rec tbody');
    tb.replaceChildren();
    const nrm = (s) =>
      String(s)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    [...R]
      .filter((r) => !filtroRec || nrm(r.nombre + ' ' + r.cod).includes(nrm(filtroRec)))
      .sort((a, b) => b.importe - a.importe)
      .forEach((r) => {
        const tr = el('tr', null, null, tb);
        const td = el('td', null, nombreLlano(r.nombre), tr);
        el('small', null, r.cod + ' · ' + ((grupoDe(r) || {}).n || 'Otros recursos'), td);
        el(
          'td',
          null,
          ladoDe(r) === 'prov'
            ? 'Provincia'
            : ladoDe(r) === 'mun'
              ? 'Vecinos y empresas'
              : 'Otros recursos',
          tr,
        );
        el('td', null, r.afectado ? 'Destino fijo' : 'Libre', tr);
        el('td', 'num', M(r.importe), tr);
      });
  }
  $('#buscar-rec').addEventListener('input', (e) => {
    filtroRec = e.target.value;
    tablaRec();
  });
  tablaRec();

  /* ---------- recorrido: quién pone → uso → área ---------- */
  const QUIEN = { prov: 'La Provincia', mun: 'Vecinos y empresas', otro: 'Otros recursos' };
  const QCOL = { prov: 'var(--turquesa)', mun: 'var(--azul)', otro: 'var(--lima)' };
  const USO = { libre: 'Libre uso', fijo: 'Destino fijo' };
  const tramoA = new Map(); // quién|uso -> monto
  R.forEach((r) => {
    const k = ladoDe(r) + '|' + (r.afectado ? 'fijo' : 'libre');
    tramoA.set(k, (tramoA.get(k) || 0) + r.importe);
  });
  const tramoB = new Map(); // uso|área -> monto
  G.forEach((r) => {
    const k = (r.fuente === '110' ? 'libre' : 'fijo') + '|' + r.jurisdiccion;
    tramoB.set(k, (tramoB.get(k) || 0) + r.importe);
  });
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (t, a, p) => {
    const e = document.createElementNS(NS, t);
    Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
    if (p) p.append(e);
    return e;
  };

  function recorrido() {
    const cont = $('#flujo');
    cont.replaceChildren();
    const W = Math.floor(cont.clientWidth || 900);
    const izq = ['prov', 'mun', 'otro'].filter((q) =>
      [...tramoA.keys()].some((k) => k.startsWith(q + '|')),
    );
    const med = ['libre', 'fijo'];
    const der = porArea.map(([n]) => n);
    const valA = (q) =>
      sum(
        [...tramoA].filter(([k]) => k.startsWith(q + '|')),
        (x) => x[1],
      );
    const valM = (u) =>
      sum(
        [...tramoA].filter(([k]) => k.endsWith('|' + u)),
        (x) => x[1],
      );
    const valD = (a) =>
      sum(
        [...tramoB].filter(([k]) => k.endsWith('|' + a)),
        (x) => x[1],
      );

    if (W < 700) {
      // celular: tres barras apiladas
      const pila = (titulo, items) => {
        const f = el('div', 'pila', null, cont);
        el('p', 'pila-t', titulo, f);
        const bar = el('div', 'pila-b', null, f);
        bar.setAttribute('role', 'img');
        bar.setAttribute(
          'aria-label',
          titulo + ': ' + items.map((i) => i.n + ' ' + M(i.v)).join('; '),
        );
        items.forEach((i) => {
          const s = el('div', i.trama ? 'trama' : '', null, bar);
          s.style.flex = String(i.v);
          s.style.backgroundColor = i.c;
        });
        const l = el('ul', 'pila-l', null, f);
        items.forEach((i) => {
          const li = el('li', null, null, l);
          const sw = el('i', i.trama ? 'trama' : '', null, li);
          sw.style.backgroundColor = i.c;
          el('span', null, i.n, li);
          el('b', null, M(i.v), li);
        });
      };
      pila(
        'Quién aporta los recursos',
        izq.map((q) => ({ n: QUIEN[q], v: valA(q), c: QCOL[q] })),
      );
      el('div', 'pila-flecha', '↓', cont).setAttribute('aria-hidden', 'true');
      pila(
        'Cómo pueden utilizarse',
        med.map((u) => ({ n: USO[u], v: valM(u), c: 'var(--gris)', trama: u === 'fijo' })),
      );
      el('div', 'pila-flecha', '↓', cont).setAttribute('aria-hidden', 'true');
      pila(
        'A qué área se destinan',
        der.map((a) => ({ n: areaCorto(a), v: valD(a), c: areaC(a) })),
      );
      return;
    }

    const lw = W < 1000 ? 150 : 180,
      rw = W < 1000 ? 160 : 190,
      nw = 14,
      pad = 22,
      top = 18;
    const H = Math.round(Math.max(440, Math.min(560, W * 0.46)));
    const k = (H - pad * (der.length - 1)) / totRec;
    const xs = [lw, lw + (W - lw - rw - nw) / 2, W - rw - nw];
    const svg = svgEl(
      'svg',
      {
        viewBox: `0 0 ${W} ${H + top * 2}`,
        width: '100%',
        role: 'img',
        'aria-label':
          'Recorrido de los recursos: quién los aporta, si son de libre uso o tienen destino fijo, y a qué área se destinan.',
      },
      cont,
    );
    const defs = svgEl('defs', {}, svg);
    const pat = svgEl(
      'pattern',
      {
        id: 'raya-flujo',
        width: 6,
        height: 6,
        patternUnits: 'userSpaceOnUse',
        patternTransform: 'rotate(45)',
      },
      defs,
    );
    const ln = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 6, 'stroke-width': 2.4 }, pat);
    ln.style.stroke = 'var(--papel)';
    ln.style.strokeOpacity = '.85';
    const columna = (nombres, val, x) => {
      const alto = sum(nombres, (n) => val(n) * k) + pad * (nombres.length - 1);
      let y = top + (H - alto) / 2;
      const out = {};
      nombres.forEach((n) => {
        const v = val(n);
        out[n] = { n, v, x, y, h: Math.max(2, v * k), sal: y, ent: y };
        y += v * k + pad;
      });
      return out;
    };
    const NI = columna(izq, valA, xs[0]),
      NM = columna(med, valM, xs[1]),
      ND = columna(der, valD, xs[2]);
    const gL = svgEl('g', {}, svg),
      gN = svgEl('g', {}, svg);
    const bandas = [];
    const banda = (desde, hasta, v, color, trama, claves, titulo) => {
      const h = v * k;
      if (h < 0.4) return;
      const x0 = desde.x + nw,
        x1 = hasta.x,
        xm = (x0 + x1) / 2,
        y0 = desde.sal,
        y1 = hasta.ent;
      desde.sal += h;
      hasta.ent += h;
      const d = `M${x0},${y0}C${xm},${y0} ${xm},${y1} ${x1},${y1}L${x1},${y1 + h}C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h}Z`;
      const p = svgEl('path', { d }, gL);
      p.style.fill = `color-mix(in srgb, ${color} 38%, var(--papel))`;
      p.dataset.k = claves.join('|');
      bandas.push(p);
      if (trama) {
        const o = svgEl('path', { d, fill: 'url(#raya-flujo)' }, gL);
        o.style.pointerEvents = 'none';
        o.dataset.k = p.dataset.k;
        bandas.push(o);
      }
      p.addEventListener('pointermove', (e) =>
        mostrarGlobo(e, titulo, M(v) + ' · ' + P(v / totRec) + ' del total'),
      );
      p.addEventListener('pointerleave', ocultarGlobo);
    };
    izq.forEach((q) =>
      med.forEach((u) => {
        const v = tramoA.get(q + '|' + u) || 0;
        if (v) banda(NI[q], NM[u], v, QCOL[q], u === 'fijo', [q, u], QUIEN[q] + ' → ' + USO[u]);
      }),
    );
    med.forEach((u) =>
      der.forEach((a) => {
        const v = tramoB.get(u + '|' + a) || 0;
        if (v)
          banda(NM[u], ND[a], v, areaC(a), u === 'fijo', [u, a], USO[u] + ' → ' + areaCorto(a));
      }),
    );
    const resaltar = (clave) => {
      bandas.forEach((p) => {
        p.style.opacity = !clave || p.dataset.k.split('|').includes(clave) ? '' : '.15';
      });
    };
    const nodo = (nd, lado, nombre, color, trama, accion) => {
      const g = svgEl('g', { class: 'nodo' }, gN);
      const r = svgEl('rect', { x: nd.x, y: nd.y, width: nw, height: nd.h, rx: 2 }, g);
      r.style.fill = color;
      if (trama)
        svgEl(
          'rect',
          { x: nd.x, y: nd.y, width: nw, height: nd.h, rx: 2, fill: 'url(#raya-flujo)' },
          g,
        );
      const tx = lado === 'izq' ? nd.x - 10 : nd.x + nw + 10,
        anc = lado === 'izq' ? 'end' : 'start';
      const t1 = svgEl(
        'text',
        { x: tx, y: nd.y + nd.h / 2 - 3, 'text-anchor': anc, class: 'fl-n' },
        g,
      );
      t1.textContent = nombre;
      const t2 = svgEl(
        'text',
        { x: tx, y: nd.y + nd.h / 2 + 13, 'text-anchor': anc, class: 'fl-v' },
        g,
      );
      t2.textContent = M(nd.v) + ' · ' + P(nd.v / totRec);
      g.addEventListener('pointerenter', () => resaltar(nd.n));
      g.addEventListener('pointerleave', () => resaltar(''));
      if (accion) {
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', nombre + ', ' + M(nd.v) + '. Ver sus programas');
        g.style.cursor = 'pointer';
        g.addEventListener('click', accion);
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') accion();
        });
      }
    };
    izq.forEach((q) => nodo(NI[q], 'izq', QUIEN[q], QCOL[q], false));
    med.forEach((u) => nodo(NM[u], 'med', USO[u], 'var(--tinta-2)', u === 'fijo'));
    der.forEach((a) =>
      nodo(ND[a], 'der', areaCorto(a), areaC(a), false, () => {
        areaSel = a;
        progSel = '';
        dibujarMapa();
        ficha();
        $('#programas').scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
      }),
    );
  }

  /* ---------- gastos ---------- */
  filas(
    $('#areas'),
    porArea.map(([n, v]) => ({ n, v, c: areaC(n) })),
    { total: totGas },
  );
  const incNom = {};
  G.forEach((r) => {
    incNom[r.inciso] = r.inciso_nombre;
  });
  filas(
    $('#incisos'),
    groupSum(G, (r) => r.inciso)
      .sort((a, b) => a[0] - b[0])
      .map(([i, v]) => ({ n: incNom[i], v, c: INC_C[i] })),
    { total: totGas },
  );

  /* ---------- programas ---------- */
  const progs = new Map();
  G.forEach((r) => {
    const k = r.jur + '|' + r.prog;
    const p = progs.get(k) || {
      k,
      programa: r.programa,
      area: r.jurisdiccion,
      personal: 0,
      bys: 0,
      uso: 0,
      transf: 0,
      total: 0,
      filas: [],
    };
    if (r.inciso === 1) p.personal += r.importe;
    else if (r.inciso <= 3) p.bys += r.importe;
    else if (r.inciso === 4) p.uso += r.importe;
    else p.transf += r.importe;
    p.total += r.importe;
    p.filas.push(r);
    progs.set(k, p);
  });
  let areaSel = '';
  let progSel = '';

  const fa = $('#filtro-areas');
  [['', 'Todas las áreas'], ...porArea.map(([n]) => [n, areaCorto(n)])].forEach(([v, t]) => {
    const b = el('button', null, null, fa);
    b.type = 'button';
    b.dataset.area = v;
    if (v) {
      const i = el('i', null, null, b);
      i.style.background = areaC(v);
    }
    b.append(t);
    b.addEventListener('click', () => {
      areaSel = v;
      progSel = '';
      dibujarMapa();
      ficha();
    });
  });

  function squarify(items, x, y, w, h) {
    const out = [];
    const total = sum(items, (i) => i.v);
    if (!total || w <= 0 || h <= 0) return out;
    const k = (w * h) / total;
    let rest = items.filter((i) => i.v > 0).map((i) => ({ i, a: i.v * k }));
    let r = { x, y, w, h };
    const peor = (row, lado) => {
      const s = sum(row, (q) => q.a);
      const mx = Math.max(...row.map((q) => q.a));
      const mn = Math.min(...row.map((q) => q.a));
      return Math.max((lado * lado * mx) / (s * s), (s * s) / (lado * lado * mn));
    };
    while (rest.length) {
      const lado = Math.min(r.w, r.h);
      const row = [rest[0]];
      let j = 1;
      while (j < rest.length && peor([...row, rest[j]], lado) <= peor(row, lado)) {
        row.push(rest[j]);
        j += 1;
      }
      const s = sum(row, (q) => q.a);
      if (r.w >= r.h) {
        const cw = s / r.h;
        let yy = r.y;
        row.forEach((q) => {
          const hh = q.a / cw;
          out.push({ ...q.i, x0: r.x, y0: yy, x1: r.x + cw, y1: yy + hh });
          yy += hh;
        });
        r = { x: r.x + cw, y: r.y, w: r.w - cw, h: r.h };
      } else {
        const rh = s / r.w;
        let xx = r.x;
        row.forEach((q) => {
          const ww = q.a / rh;
          out.push({ ...q.i, x0: xx, y0: r.y, x1: xx + ww, y1: r.y + rh });
          xx += ww;
        });
        r = { x: r.x, y: r.y + rh, w: r.w, h: r.h - rh };
      }
      rest = rest.slice(j);
    }
    return out;
  }

  function dibujarMapa() {
    $$('#filtro-areas button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.area === areaSel)),
    );
    const mapa = $('#mapa');
    mapa.replaceChildren();
    const W = mapa.clientWidth || 800;
    const lista = [...progs.values()].filter((p) => !areaSel || p.area === areaSel);
    const H = Math.round(
      W < 600 ? Math.max(520, W * 1.45) : Math.min(640, Math.max(440, W * 0.56)),
    );
    mapa.style.height = H + 'px';
    const grupos = areaSel
      ? [{ n: areaSel, v: sum(lista, (p) => p.total) }]
      : porArea.map(([n, v]) => ({ n, v }));
    const elegir = (p) => {
      progSel = progSel === p.k ? '' : p.k;
      ocultarGlobo();
      dibujarMapa();
      ficha(true);
    };

    // En pantallas angostas, una lista por área se lee mejor que el mapa
    if (W < 600) {
      mapa.style.height = 'auto';
      mapa.classList.add('es-lista');
      const maxProg = Math.max(...lista.map((p) => p.total));
      grupos.forEach((g) => {
        const sec = el('div', 'lp-grupo', null, mapa);
        sec.style.setProperty('--c', areaC(g.n));
        const t = el('div', 'lp-t', null, sec);
        el('span', null, areaCorto(g.n), t);
        el('span', 'lp-m', M(g.v), t);
        lista
          .filter((p) => p.area === g.n)
          .sort((a, b) => b.total - a.total)
          .forEach((p) => {
            const b = el('button', 'lp-item', null, sec);
            b.type = 'button';
            b.setAttribute('aria-pressed', String(p.k === progSel));
            el('span', 'lp-n', p.programa, b);
            el('span', 'lp-m', M(p.total), b);
            const bar = el('span', 'lp-bar', null, b);
            const i = el('i', null, null, bar);
            i.style.width = (p.total / maxProg) * 100 + '%';
            b.addEventListener('click', () => elegir(p));
          });
      });
      return;
    }
    mapa.classList.remove('es-lista');
    const gap = 3;
    squarify(grupos, 0, 0, W, H).forEach((g) => {
      const gw = g.x1 - g.x0,
        gh = g.y1 - g.y0;
      const gd = el('div', 'grupo', null, mapa);
      Object.assign(gd.style, {
        left: g.x0 + 'px',
        top: g.y0 + 'px',
        width: gw - gap + 'px',
        height: gh - gap + 'px',
      });
      gd.style.setProperty('--c', areaC(g.n));
      const gt = el('div', 'grupo-t', null, gd);
      const cortos = {
        'Concejo Deliberante': 'HCD',
        'Conducción Superior': 'Conducción',
        'Hacienda y Finanzas': 'Hacienda',
        'Derechos Humanos': 'DD. HH.',
      };
      const opciones = [
        areaCorto(g.n) + ' · ' + M(g.v),
        areaCorto(g.n),
        cortos[areaCorto(g.n)] || '',
        '',
      ];
      for (const o of opciones) {
        gt.textContent = o;
        if (gt.scrollWidth <= gt.clientWidth + 1) break;
      }
      const hijos = lista
        .filter((p) => p.area === g.n)
        .map((p) => ({ ...p, v: p.total }))
        .sort((a, b) => b.v - a.v);
      squarify(hijos, 0, 28, gw - gap, gh - gap - 28).forEach((p) => {
        const w = p.x1 - p.x0,
          h = p.y1 - p.y0;
        const b = el('button', 'celda', null, gd);
        b.type = 'button';
        Object.assign(b.style, {
          left: p.x0 + 'px',
          top: p.y0 + 'px',
          width: Math.max(0, w - 2) + 'px',
          height: Math.max(0, h - 2) + 'px',
        });
        b.style.setProperty('--c', areaC(g.n));
        b.style.setProperty(
          '--lineas',
          String(Math.max(1, Math.min(4, Math.floor((h - 30) / 16)))),
        );
        if (w < 64 || h < 40) b.classList.add('chica');
        b.setAttribute('aria-label', p.programa + ', ' + M(p.total));
        b.setAttribute('aria-pressed', String(p.k === progSel));
        el('span', 'n', p.programa, b);
        if (h > 52) el('span', 'm', M(p.total), b);
        b.addEventListener('pointermove', (e) =>
          mostrarGlobo(
            e,
            p.programa,
            M(p.total) + ' · ' + P(p.total / totGas) + ' del presupuesto',
          ),
        );
        b.addEventListener('pointerleave', ocultarGlobo);
        b.addEventListener('click', () => elegir(p));
      });
    });
  }

  function ficha(desplazar) {
    const f = $('#ficha');
    const p = progs.get(progSel);
    if (!p) {
      f.hidden = true;
      return;
    }
    f.hidden = false;
    f.style.setProperty('--c', areaC(p.area));
    $('#ficha-area').textContent = p.area;
    $('#ficha-titulo').textContent = p.programa;
    $('#ficha-total').textContent = M(p.total) + ' · ' + P(p.total / totGas) + ' del presupuesto';
    filas(
      $('#ficha-incisos'),
      groupSum(p.filas, (r) => r.inciso)
        .sort((a, b) => a[0] - b[0])
        .map(([i, v]) => ({ n: incNom[i], v, c: INC_C[i] })),
      { total: p.total },
    );
    filas(
      $('#ficha-actividades'),
      groupSum(p.filas, (r) => r.actividad || 'Conducción y gestión del programa')
        .sort((a, b) => b[1] - a[1])
        .map(([n, v]) => ({ n, v, c: areaC(p.area) })),
      { total: p.total },
    );
    setTimeout(
      () =>
        $$('#ficha .vm').forEach((e) => {
          const n = parseFloat(e.textContent.replace(/[^\d,]/g, '').replace(',', '.'));
          const conMil = e.textContent.includes('mil');
          if (isFinite(n))
            tween(
              e,
              0,
              n,
              (x) =>
                '$' + (conMil ? nf0.format(x) + ' mil' : (n >= 100 ? nf0 : nf1).format(x) + ' M'),
              1000,
            );
        }),
      0,
    );
    filas(
      $('#ficha-fuentes'),
      groupSum(p.filas, (r) => r.fuente_nombre)
        .sort((a, b) => b[1] - a[1])
        .map(([n, v]) => ({ n, v, c: 'var(--gris)', trama: !n.startsWith('Rentas') })),
      { total: p.total },
    );
    if (desplazar && f.getBoundingClientRect().top > innerHeight * 0.75)
      f.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest',
      });
  }
  $('#ficha-cerrar').addEventListener('click', () => {
    progSel = '';
    dibujarMapa();
    ficha();
  });

  let orden = { k: 'total', d: -1 };
  let filtroTxt = '';
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function tabla() {
    const tb = $('#tabla-prog tbody');
    tb.replaceChildren();
    const lista = [...progs.values()].filter(
      (p) => !filtroTxt || norm(p.programa + ' ' + p.area).includes(norm(filtroTxt)),
    );
    lista.sort((a, b) =>
      orden.k === 'programa'
        ? orden.d * a.programa.localeCompare(b.programa)
        : orden.d * (a[orden.k] - b[orden.k]),
    );
    lista.forEach((p) => {
      const tr = el('tr', null, null, tb);
      tr.tabIndex = 0;
      const td = el('td', null, p.programa, tr);
      el('small', null, p.area, td);
      ['personal', 'bys', 'uso', 'transf', 'total'].forEach((k) =>
        el('td', 'num', p[k] ? M(p[k]) : '—', tr),
      );
      const abrir = () => {
        progSel = p.k;
        areaSel = '';
        dibujarMapa();
        ficha();
        $('#mapa').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      tr.addEventListener('click', abrir);
      tr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') abrir();
      });
    });
    if (!lista.length) {
      const tr = el('tr', null, null, tb);
      const td = el('td', null, 'No hay programas que coincidan con la búsqueda.', tr);
      td.colSpan = 6;
    }
    $$('#tabla-prog th').forEach((th) =>
      th.setAttribute(
        'aria-sort',
        th.dataset.orden === orden.k ? (orden.d > 0 ? 'ascending' : 'descending') : 'none',
      ),
    );
  }
  $$('#tabla-prog th').forEach((th) =>
    th.addEventListener('click', () => {
      const k = th.dataset.orden;
      orden = { k, d: orden.k === k ? -orden.d : k === 'programa' ? 1 : -1 };
      tabla();
    }),
  );
  $('#buscar-prog').addEventListener('input', (e) => {
    filtroTxt = e.target.value;
    tabla();
  });

  /* ---------- qué cambia en 2027 ---------- */
  const CB = window.CAMBIOS;
  function cambios() {
    if (!CB) return;
    const t = CB.total,
      infl = CB.meta.inflacion_2027;
    const sg = (v) => (v >= 0 ? '+' : '−') + P(Math.abs(v));
    $('#cambios-lectura').textContent =
      'El presupuesto 2027 se formuló con una inflación estimada del ' +
      P(infl) +
      ', a la que se suman la estacionalidad, el crecimiento esperado de la actividad y las particularidades de cada recurso. Por eso, frente a la proyección de cierre del ejercicio 2026, que cierra en equilibrio en ' +
      M(t.rec_c2026) +
      ', los recursos y los gastos de 2027 crecen ' +
      P(t.rec_var) +
      ' en términos nominales.';
    const dc = $('#dos-comparaciones');
    dc.replaceChildren();
    [
      [
        t.rec_var,
        'Recursos',
        M(t.rec_c2026) + ' proyectados al cierre de 2026 → ' + M(t.rec_p2027) + ' en 2027.',
      ],
      [
        t.gas_var,
        'Gastos',
        M(t.gas_c2026) + ' proyectados al cierre de 2026 → ' + M(t.gas_p2027) + ' en 2027.',
      ],
    ].forEach(([v, n, d]) => {
      const c = el('div', 'cmp ' + (v >= 0 ? 'sube' : 'baja'), null, dc);
      const big = el('p', 'cmp-v', null, c);
      el('span', 'cmp-flecha', v >= 0 ? '▲' : '▼', big);
      big.append(sg(v));
      el('p', 'cmp-n', n + ', frente a la proyección de cierre 2026', c);
      el('p', 'cmp-d', d, c);
    });

    const dp = $('#dos-presup');
    dp.replaceChildren();
    const items = [
      {
        n: 'Presupuesto aprobado 2026',
        d: 'Crédito inicial autorizado al comenzar el ejercicio. Se muestra como referencia.',
        v: t.b2026,
        cls: 'dp-apr',
      },
      {
        n: 'Proyección de cierre 2026',
        d: 'Ejecución de enero a octubre más lo proyectado para noviembre y diciembre, en equilibrio con los recursos.',
        v: t.gas_c2026,
        cls: 'dp-cierre',
      },
      { n: 'Anteproyecto 2027', d: 'Lo que se propone ahora.', v: t.gas_p2027, cls: 'dp-27' },
    ];
    const max = Math.max(...items.map((i) => i.v));
    items.forEach((i) => {
      const f = el('div', 'dp ' + i.cls, null, dp);
      const top = el('div', 'dp-top', null, f);
      el('b', null, i.n, top);
      el('span', 'dp-v', M(i.v), top);
      const b = el('div', 'dp-bar', null, f);
      const fi = el('i', null, null, b);
      fi.style.width = (i.v / max) * 100 + '%';
      el('p', 'dp-d', i.d, f);
    });
    el('p', 'nota', 'Importes en pesos corrientes de cada año.', dp);
    $('#cambios-metodo').textContent =
      'Recursos 2026: proyección de cierre recurso por recurso, con la distribución provincial registrada y el ritmo de recaudación municipal. Gastos 2026: devengado de enero a octubre según SIMCO, más noviembre y diciembre estimados con el comportamiento de 2025; personal y deuda se proyectan completos y el resto se ajusta para cerrar en equilibrio con los recursos. Las variaciones son nominales: no descuentan la inflación.';

    // novedades confirmadas por la Secretaría de Hacienda
    const act = (n) =>
      sum(
        G.filter((g) => g.actividad === n),
        (g) => g.importe,
      );
    const r22 = [
      'Residuos urbanos y disposición final',
      'Residuos no convencionales',
      'Residuos sólidos urbanos y recolección diferenciada',
    ];
    const fe = R.find((r) => r.cod === '11.4.05.00');
    const NOV = [
      {
        icon: 'siren',
        t: 'Se incorpora Defensa Civil',
        d:
          'Es un área que venía funcionando dentro de Seguridad y ahora se institucionaliza como programa aparte, con ' +
          M(act('Defensa Civil')) +
          ' para 2027.',
      },
      {
        icon: 'recycle',
        t: 'La recolección de residuos se divide en tres',
        d:
          'Para ver y analizar mejor el costo de cada servicio: ' +
          r22
            .map((n) => n.charAt(0).toLowerCase() + n.slice(1) + ' (' + M(act(n)) + ')')
            .join(', ') +
          '.',
      },
      fe && {
        icon: 'book-open',
        t: 'Fondo Educativo: ' + M(fe.importe),
        d: 'Viene de la Provincia y solo puede usarse en educación.',
      },
    ].filter(Boolean);
    const ol = $('#nov-lista');
    ol.replaceChildren();
    NOV.forEach((n) => {
      const li = el('li', null, null, ol);
      const b = el('b', null, null, li);
      ico(n.icon, b, 'ico-in');
      b.append(n.t);
      el('p', null, n.d, li);
    });

    const ad = (cont, filasAD, colorDe) => {
      cont.replaceChildren();
      const mx = Math.max(...filasAD.flatMap((f) => [f.c2026, f.p2027]));
      filasAD
        .filter((f) => f.c2026 || f.p2027)
        .forEach((f) => {
          const r = el('div', 'ad', null, cont);
          r.style.setProperty('--c', colorDe(f.nombre));
          const top = el('div', 'ad-top', null, r);
          el('span', 'ad-n', f.nombre, top);
          const v = f.var;
          if (v != null)
            el(
              'span',
              'ad-var ' + (v >= 0 ? 'sube' : 'baja'),
              (v >= 0 ? '▲ +' : '▼ −') + P(Math.abs(v)),
              top,
            );
          const b = el('div', 'ad-bars', null, r);
          const b1 = el('i', 'ad-26', null, b);
          b1.style.width = (f.c2026 / mx) * 100 + '%';
          const b2 = el('i', 'ad-27', null, b);
          b2.style.width = (f.p2027 / mx) * 100 + '%';
          el('p', 'ad-m', M(f.c2026) + ' → ' + M(f.p2027), r);
          if (f.desc) el('p', 'ad-desc', f.desc, r);
        });
    };
    const LCOL = { prov: 'var(--turquesa)', mun: 'var(--azul)', otro: 'var(--lima)' };
    ad(
      $('#cmp-recursos'),
      CB.recursos,
      (n) => LCOL[(CB.recursos.find((r) => r.nombre === n) || {}).lado] || 'var(--azul)',
    );
    const DCOL = { infra: 'var(--azul)', comun: 'var(--turquesa)', gob: 'var(--lima)' };
    ad(
      $('#cmp-areas'),
      CB.destinos,
      (n) => DCOL[(CB.destinos.find((d) => d.nombre === n) || {}).clave] || 'var(--azul)',
    );
    ad(
      $('#cmp-incisos'),
      CB.incisos,
      (n) => INC_C[Object.values(incNom).indexOf(n) + 1] || 'var(--azul)',
    );
  }
  cambios();

  /* ---------- ¿qué financian las tasas? ---------- */
  const TASAS = [
    {
      icon: 'tractor',
      n: 'Servicios rurales',
      quien: 'Los propietarios de campos, por hectárea.',
      que: 'Conservación, reparación y mejorado de los caminos rurales.',
      cods: ['12.1.03.01', '12.1.03.02'],
    },
    {
      icon: 'lightbulb',
      n: 'Alumbrado público',
      quien: 'Todos los inmuebles del partido.',
      que: 'El alumbrado de calles y espacios públicos.',
      cods: ['12.1.01.03'],
    },
    {
      icon: 'droplets',
      n: 'Servicios sanitarios',
      quien: 'Los inmuebles conectados a la red.',
      que: 'Agua corriente y cloacas, conexiones y reparaciones.',
      cods: ['12.1.15.01', '12.1.15.02', '12.1.15.03'],
    },
    {
      icon: 'trees',
      n: 'Servicios urbanos',
      quien: 'Las propiedades urbanas, por metro de frente.',
      que: 'Barrido, limpieza, riego, plazas, espacios verdes y poda.',
      cods: ['12.1.01.01', '12.1.01.02'],
    },
    {
      icon: 'fuel',
      n: 'Tasa vial urbana',
      quien: 'Quien carga combustible en estaciones del partido.',
      que: 'Señalización, reparación y mejora de las calles.',
      cods: ['12.1.17.01'],
    },
    {
      icon: 'store',
      n: 'Seguridad e higiene',
      quien: 'Comercios, industrias y servicios, según sus ingresos.',
      que: 'Inspección de seguridad, higiene y ambiente de las actividades económicas.',
      cods: ['12.1.05.01', '12.1.05.02'],
    },
    {
      icon: 'tag',
      n: 'Marcas y señales',
      quien: 'Productores ganaderos.',
      que: 'Control y registro de marcas y señales del ganado.',
      cods: ['12.1.16.01'],
    },
    {
      icon: 'shield-check',
      n: 'Fortalecimiento de la seguridad',
      quien: 'Los contribuyentes de la tasa de servicios urbanos.',
      que: 'Seguridad pública.',
      cods: ['12.1.01.04'],
    },
    {
      icon: 'paw-print',
      n: 'Prevención zoonótica',
      quien: 'Los contribuyentes de la tasa de servicios sanitarios.',
      que: 'Control de la población canina y felina: castraciones y vacunación.',
      cods: ['12.1.15.04'],
    },
    {
      icon: 'truck',
      n: 'Red de tránsito pesado',
      quien: 'Usuarios de la red de tránsito pesado.',
      que: 'Mantenimiento de las calles por donde circulan camiones.',
      cods: ['12.1.22.00'],
    },
    {
      icon: 'flame',
      n: 'Bomberos voluntarios',
      quien: 'Se cobra junto con las tasas.',
      que: 'Aporte al cuerpo de Bomberos Voluntarios.',
      cods: ['12.1.03.05'],
    },
  ];
  (function tasas() {
    const cont = $('#lista-tasas');
    const items = TASAS.map((t) => {
      const rs = R.filter((r) => t.cods.includes(r.cod));
      return { ...t, v: sum(rs, (r) => r.importe), fijo: rs.some((r) => r.afectado) };
    })
      .filter((t) => t.v > 0)
      .sort((x, y) => y.v - x.v);
    const max = Math.max(...items.map((t) => t.v));
    items.forEach((t) => {
      const art = el('article', 'tasa', null, cont);
      const cab = el('div', 'tasa-cab', null, art);
      const h3 = el('h3', null, null, cab);
      ico(t.icon, h3, 'ico-in');
      h3.append(t.n);
      el(
        'span',
        'tasa-uso ' + (t.fijo ? 'fijo' : 'libre'),
        t.fijo ? 'Destino fijo' : 'Libre uso',
        cab,
      );
      const m = el('p', 'tasa-m', null, art);
      el('b', null, M(t.v), m);
      m.append(' en 2027 · ' + '$' + nf0.format(Math.round(t.v / POBLACION)) + ' por habitante');
      const b = el('div', 'tasa-bar' + (t.fijo ? ' trama' : ''), null, art);
      b.style.width = (t.v / max) * 100 + '%';
      const dl = el('dl', null, null, art);
      el('dt', null, 'Quién la paga', dl);
      el('dd', null, t.quien, dl);
      el('dt', null, 'Qué cubre', dl);
      el('dd', null, t.que, dl);
    });
  })();

  /* ---------- frente a otros municipios ---------- */
  (function municipios() {
    const MU = window.MUNICIPIOS;
    if (!MU) return;
    const cont = $('#indicadores');
    MU.indicadores.forEach((i) => {
      const art = el('article', 'ind', null, cont);
      el('h3', null, i.n, art);
      el('p', 'ind-d', i.d, art);
      const max = Math.max(i.local2024, i.provincia2024, i.local2027 || 0) * 1.15;
      const fila = (cls, n, v) => {
        const f = el('div', 'ind-f ' + cls, null, art);
        el('span', 'ind-n', n, f);
        const t = el('span', 'ind-t', null, f);
        const b = el('i', null, null, t);
        b.style.width = (v / max) * 100 + '%';
        el('b', 'ind-v', P(v), f);
      };
      fila('ki-cda', 'Carmen de Areco 2024', i.local2024);
      fila('ki-prov', 'Provincia 2024', i.provincia2024);
      if (i.local2027 != null) fila('ki-27', 'Presupuesto 2027', i.local2027);
    });
  })();

  /* ---------- los costos económicos de la era Milei ---------- */
  (function milei() {
    const D = window.MILEI;
    if (!D) return;
    const r = D.resumen,
      F = D.filas,
      base = { total: D.meta.base_total };
    $('#milei-lectura').textContent =
      'Desde 2024 el Gobierno nacional dejó de enviar fondos a los municipios, frenó la obra pública y la recesión redujo lo que llega desde la Provincia. Frente al promedio de 2022 y 2023, Carmen de Areco cuenta con ' +
      M(r.perdida_promedio_anual) +
      ' menos por año. Sumados 2024 a 2027, son ' +
      M(r.perdida) +
      ': ' +
      nf1.format(r.presupuestos) +
      ' veces el presupuesto 2027 completo.';
    const cif = $('#mil-cifras');
    cif.replaceChildren();
    [
      [
        M(r.perdida),
        'perdidos entre 2024 y 2027',
        'Diferencia entre los recursos de cada año y el promedio de 2022 y 2023, en pesos de 2027.',
      ],
      [
        nf1.format(r.presupuestos),
        'presupuestos 2027 completos',
        'Lo perdido alcanzaría para financiar ' +
          nf1.format(r.presupuestos) +
          ' veces todo el presupuesto 2027 (' +
          M(r.presupuesto_2027) +
          ').',
      ],
      [
        '$' + nf0.format(r.perdida_vecino),
        'por vecino',
        'Lo que dejó de recibir el municipio por cada habitante en esos cuatro años.',
      ],
      [
        M(r.nac_perdida),
        'de transferencias nacionales',
        'Promedio de ' +
          M(r.nac_base_anual) +
          ' por año entre 2020 y 2023; desde 2024, prácticamente cero.',
      ],
    ].forEach(([v, n, d]) => {
      const c = el('div', 'mil-c', null, cif);
      const p = el('p', 'mil-v', null, c);
      el('span', 'cmp-flecha', '▼', p);
      el('span', null, v, p);
      el('p', 'mil-n', n, c);
      el('p', 'mil-d', d, c);
    });

    // columnas apiladas por origen, con la pérdida frente al promedio 2022-2023
    const cols = $('#mil-cols');
    cols.replaceChildren();
    const mx = Math.max(...F.map((f) => Math.max(f.total, base.total)));
    el('span', 'mil-ref', 'Promedio 2022–2023 · ' + M(base.total), cols);
    cols.setAttribute(
      'aria-label',
      'Recursos por año en pesos de 2027: ' + F.map((f) => f.anio + ' ' + M(f.total)).join('; '),
    );
    F.forEach((f, i) => {
      const c = el('div', 'mil-col' + (D.meta.era.includes(f.anio) ? ' era' : ''), null, cols);
      c.style.animationDelay = i * 70 + 'ms';
      const pila = el('div', 'mil-pila', null, c);
      pila.style.setProperty('--ref', (base.total / mx) * 100 + '%');
      el('span', 'mil-ref-l', null, pila);
      if (f.perdida > 0) {
        const p = el('i', 'mk-perd', null, pila);
        p.style.height = (f.perdida / mx) * 100 + '%';
        p.title = 'Pérdida frente al promedio 2022–2023: ' + M(f.perdida);
      }
      [
        ['mun', 'mk-mun'],
        ['prov', 'mk-prov'],
        ['nac', 'mk-nac'],
      ].forEach(([k, cls]) => {
        if (f[k] > 0) {
          const s = el('i', cls, null, pila);
          s.style.height = (f[k] / mx) * 100 + '%';
        }
      });
      el('b', 'mil-col-v', M(f.total), c);
      const ast = f.anio === 2026 ? '*' : f.anio === 2027 ? '**' : '';
      const ca = el('span', 'mil-col-a', null, c);
      el('span', 'largo', String(f.anio) + ast, ca);
      el('span', 'corto', "'" + String(f.anio).slice(2) + ast, ca);
      el('span', 'mil-col-p', f.perdida > 0 ? '−' + M(f.perdida) : '·', c);
    });

    const nac = $('#mil-nac');
    nac.replaceChildren();
    const mn = Math.max(...F.map((f) => f.nac));
    nac.setAttribute(
      'aria-label',
      'Transferencias nacionales por año: ' + F.map((f) => f.anio + ' ' + M(f.nac)).join('; '),
    );
    F.forEach((f) => {
      const row = el('div', 'mil-nac-f', null, nac);
      el('span', 'a', String(f.anio), row);
      const b = el('div', 'mil-nac-b', null, row);
      const fi = el('i', null, null, b);
      fi.style.width = Math.max(0.6, (f.nac / mn) * 100) + '%';
      el('span', 'v', f.nac < 1e6 ? '$0' : M(f.nac), row);
    });

    const pct = (a, b) => P(Math.abs(b / a - 1));
    const CAUSAS = [
      {
        icon: 'ban',
        t: 'Se cortaron las transferencias nacionales',
        d:
          'Pasaron de ' +
          M(r.nac_2023) +
          ' en 2023 a ' +
          M(r.nac_2024) +
          ' en 2024 y a cero desde 2025: programas, convenios y fondos para obras.',
      },
      {
        icon: 'construction',
        t: 'Se paralizó la obra pública nacional',
        d:
          'La inversión del municipio en obras y equipamiento cayó ' +
          pct(r.obra_2023, r.obra_2024) +
          ' en 2024, de ' +
          M(r.obra_2023) +
          ' a ' +
          M(r.obra_2024) +
          ', sin financiamiento nacional.',
      },
      {
        icon: 'trending-down',
        t: 'La recesión redujo los fondos provinciales',
        d:
          'Con menos actividad se recaudan menos impuestos y baja la coparticipación: lo que llegó de la Provincia cayó ' +
          pct(r.prov_2023, r.prov_2024) +
          ' en 2024, descontada la inflación.',
      },
      {
        icon: 'flame',
        t: 'Devaluación e inflación',
        d:
          'La devaluación de diciembre de 2023 llevó la inflación a ' +
          P(r.inflacion_dic_2023) +
          ' en ese mes y a ' +
          P(r.inflacion_2024) +
          ' en 2024, lo que achicó el valor real de todos los recursos.',
      },
      {
        icon: 'zap',
        t: 'Quita de subsidios a la energía y el transporte',
        d: 'Encarece el alumbrado público, los edificios municipales y los servicios que presta el municipio.',
      },
    ];
    const ul = $('#mil-causas');
    ul.replaceChildren();
    CAUSAS.forEach((c) => {
      const li = el('li', null, null, ul);
      const b = el('b', null, null, li);
      ico(c.icon, b, 'ico-in');
      b.append(c.t);
      el('p', null, c.d, li);
    });
    const np = $('#mil-nac-pct');
    np.replaceChildren();
    el('b', null, P(r.nac_pct_2023), np);
    np.append(' de los recursos del municipio venía de Nación en 2023. Desde 2024, ');
    el('b', null, P(r.nac_pct_2025), np);
    np.append('.');

    const OBRAS = [
      {
        n: 'Ruta Nacional 7, tramo Carmen de Areco–Chacabuco',
        d: '55 kilómetros de autopista.',
        e: 'Paralizada',
      },
      {
        n: 'Acceso a Gouin por la Ruta Nacional 7',
        d: '2,7 kilómetros y un distribuidor de tránsito.',
        e: 'Paralizada',
      },
      {
        n: 'Avenida Mitre',
        d: 'Repavimentación y bulevar, iniciada con un anticipo nacional.',
        e: 'Paralizada',
      },
      {
        n: 'Red cloacal, segunda etapa',
        d: '1.500 metros de cañería, financiados por el ENOHSA.',
        e: 'Paralizada',
      },
      {
        n: 'Avenida Sarmiento',
        d: 'Se hicieron 70 de los 530 metros previstos antes de que se cortara el financiamiento.',
        e: 'Paralizada',
      },
      {
        n: 'Centro de Desarrollo Infantil (CDI) 1',
        d: 'Quedó paralizado por el corte de fondos nacionales.',
        e: 'La termina el municipio',
        ok: true,
      },
    ];
    const uo = $('#mil-obras');
    uo.replaceChildren();
    OBRAS.forEach((o) => {
      const li = el('li', null, null, uo);
      const top = el('div', 'mil-obra-top', null, li);
      el('b', null, o.n, top);
      el('span', 'mil-estado' + (o.ok ? ' ok' : ''), o.e, top);
      el(
        'p',
        null,
        o.d + (o.ok ? ' El municipio lo está terminando con el Fondo Educativo.' : ''),
        li,
      );
    });

    const PROGRAMAS = [
      {
        icon: 'truck',
        t: 'Municipios de Pie',
        d: 'Entre 2020 y 2023 aportó 37 vehículos y equipos: el camión compactador, la motoniveladora y la aparatología del Centro de Diálisis, entre otros. Desde 2024 no hubo nuevas entregas.',
      },
      {
        icon: 'droplets',
        t: 'ENOHSA',
        d: 'El organismo nacional que financiaba obras de agua y cloacas fue disuelto en 2024 (Decreto 1020/2024).',
      },
      {
        icon: 'house-plus',
        t: 'PROCREAR',
        d: 'El programa de crédito y vivienda fue disuelto en 2024 (Decreto 1018/2024).',
      },
      {
        icon: 'bus',
        t: 'Fondo Compensador al Transporte',
        d: 'El fondo que sostenía el transporte público del interior se discontinuó en 2024.',
      },
    ];
    const upr = $('#mil-programas');
    upr.replaceChildren();
    PROGRAMAS.forEach((c) => {
      const li = el('li', null, null, upr);
      const b = el('b', null, null, li);
      ico(c.icon, b, 'ico-in');
      b.append(c.t);
      el('p', null, c.d, li);
    });

    const DEMANDAS = [
      {
        icon: 'pill',
        t: 'Medicamentos',
        d: 'PAMI redujo la cobertura de medicamentos y se recortaron Remediar y la entrega de remedios para enfermedades crónicas y oncológicas. Más vecinos recurren al municipio para conseguirlos.',
      },
      {
        icon: 'utensils',
        t: 'Alimentos',
        d: 'Con la caída de los ingresos y el retiro de la asistencia alimentaria nacional, más familias recurren al municipio en busca de ayuda.',
      },
      {
        icon: 'plug-zap',
        t: 'Luz y gas',
        d: 'Con la quita de subsidios, las facturas aumentaron y llegan más pedidos de ayuda para pagarlas.',
      },
      {
        icon: 'house',
        t: 'Alquileres',
        d: 'Familias que no llegan a cubrir el alquiler buscan apoyo en el municipio, como ocurre en otros distritos bonaerenses.',
      },
    ];
    const ud = $('#mil-demandas');
    ud.replaceChildren();
    DEMANDAS.forEach((c) => {
      const li = el('li', null, null, ud);
      const b = el('b', null, null, li);
      ico(c.icon, b, 'ico-in');
      b.append(c.t);
      el('p', null, c.d, li);
    });
    const HIZO = [
      {
        icon: 'scale',
        t: 'Cuentas en equilibrio, sin endeudarse',
        d:
          'El ejercicio 2026 cierra sin gastar más de lo que ingresa y el presupuesto 2027 también está equilibrado. La deuda representa apenas ' +
          P(r.deuda_pct_2027) +
          ' del presupuesto.',
      },
      {
        icon: 'badge-check',
        t: 'Sueldos dentro de la pauta',
        d:
          'El gasto en personal de 2027 crece ' +
          P(r.personal_var_2027) +
          ', por debajo de la inflación estimada del ' +
          P(r.inflacion_2027) +
          '.',
      },
      {
        icon: 'heart-handshake',
        t: 'Más asistencia social con fondos propios',
        d:
          'Lo que el municipio destina de sus propios fondos a promoción y asistencia social creció ' +
          pct(r.social_propios_2024, r.social_propios_2026) +
          ' entre 2024 y 2026, descontada la inflación: de ' +
          M(r.social_propios_2024) +
          ' a ' +
          M(r.social_propios_2026) +
          '.',
      },
      {
        icon: 'stethoscope',
        t: 'La salud se sostuvo pese al corte de fondos',
        d:
          'Los fondos de otros niveles de gobierno para salud cayeron ' +
          pct(r.salud_otros_2023, r.salud_otros_2026) +
          ' entre 2023 y 2026. El municipio sostiene la atención con ' +
          M(r.salud_propios_2026) +
          ' de recursos propios.',
      },
    ];
    const uh = $('#mil-hizo');
    uh.replaceChildren();
    HIZO.forEach((c) => {
      const li = el('li', null, null, uh);
      const b = el('b', null, null, li);
      ico(c.icon, b, 'ico-in');
      b.append(c.t);
      el('p', null, c.d, li);
    });
    $('#mil-metodo').textContent =
      'Recursos percibidos según SIMCO, por origen, en pesos promedio de 2027 con el IPC de INDEC. * 2026: enero a octubre más la proyección de cierre. ** 2027: anteproyecto. La pérdida de cada año es la diferencia con el promedio de los recursos de 2022 y 2023, los dos últimos años antes del cambio de gobierno nacional. Por vecino: población estimada de cada año a partir de los censos 2010 y 2022. Asistencia social y salud: enero a octubre de cada año, para comparar con 2026.';
  })();

  /* ---------- evolución en pesos de 2027 ---------- */
  const SERIES = {
    gasto: { n: 'el gasto total', f: (r, real) => r[real ? 'gasto_real' : 'gasto_nominal'] },
    recursos: {
      n: 'los recursos',
      pl: true,
      f: (r, real) => r[real ? 'recursos_real' : 'recursos_nominal'],
    },
    i1: { n: 'el gasto en personal', f: (r, real) => r['inciso_1_' + (real ? 'real' : 'nominal')] },
    i23: {
      n: 'el gasto en bienes y servicios',
      f: (r, real) =>
        r['inciso_2_' + (real ? 'real' : 'nominal')] + r['inciso_3_' + (real ? 'real' : 'nominal')],
    },
    i4: {
      n: 'el gasto en obras y equipamiento',
      f: (r, real) => r['inciso_4_' + (real ? 'real' : 'nominal')],
    },
    i5: {
      n: 'las transferencias',
      pl: true,
      f2: true,
      f: (r, real) => r['inciso_5_' + (real ? 'real' : 'nominal')],
    },
  };
  let serie = 'gasto';
  const nominal = $('#evo-nominal');
  $$('#evo-serie button').forEach((b) =>
    b.addEventListener('click', () => {
      serie = b.dataset.serie;
      evolucion();
    }),
  );
  nominal.addEventListener('change', () => evolucion());
  const porHabEl = $('#evo-hab');
  porHabEl.addEventListener('change', () => evolucion());
  // Población por año: crecimiento geométrico entre los censos 2010 (14.692) y 2022 (17.499), proyectado igual hasta 2027
  const TASA_POB = Math.pow(17499 / 14692, 1 / 12) - 1;
  const poblacion = (anio) => 17499 * Math.pow(1 + TASA_POB, anio - 2022);

  function evolucion() {
    $$('#evo-serie button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.serie === serie)),
    );
    const real = !nominal.checked;
    const def = SERIES[serie];
    const ph = porHabEl.checked;
    const datos = S.filas.map((r) => ({
      anio: r.anio,
      tipo: r.tipo,
      v: def.f(r, real) / (ph ? poblacion(r.anio) : 1),
    }));
    const MF = (v) => (ph ? '$' + nf0.format(Math.round(v)) : M(v));
    const cont = $('#evo-grafico');
    const W = Math.max(300, cont.clientWidth || 800);
    const H = W < 600 ? 330 : 410;
    const m = { t: 62, r: 4, b: 30, l: 4 };
    const max = Math.max(...datos.map((d) => d.v)) * 1.08;
    const n = datos.length;
    const paso = (W - m.l - m.r) / n;
    const ancho = Math.min(68, paso * 0.68);
    const yv = (v) => m.t + (H - m.t - m.b) * (1 - v / max);
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (t, a, p) => {
      const e = document.createElementNS(NS, t);
      Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
      if (p) p.append(e);
      return e;
    };
    let svg = cont.querySelector('svg');
    const nuevo = !svg;
    if (nuevo) {
      svg = sv('svg', {}, cont);
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute(
      'aria-label',
      'Columnas por año, de 2019 a 2027, ' +
        (real ? 'en pesos de 2027' : 'en pesos de cada año') +
        ': ' +
        datos.map((d) => d.anio + ' ' + M(d.v)).join('; '),
    );
    svg.replaceChildren();
    const defs = sv('defs', {}, svg);
    const pat = sv(
      'pattern',
      {
        id: 'rayado',
        width: 6,
        height: 6,
        patternUnits: 'userSpaceOnUse',
        patternTransform: 'rotate(45)',
      },
      defs,
    );
    sv('rect', { width: 6, height: 6, fill: '#5E7FAE' }, pat);
    sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: css('--oscuro'), 'stroke-width': 2.2 }, pat);
    [0.25, 0.5, 0.75].forEach((f) =>
      sv(
        'line',
        { class: 'rej', x1: 0, x2: W, y1: yv((max / 1.08) * f), y2: yv((max / 1.08) * f) },
        svg,
      ),
    );
    sv('line', { class: 'rej', x1: 0, x2: W, y1: yv(0), y2: yv(0) }, svg);
    // Períodos de contexto: franja detrás de las columnas, con su nombre arriba
    const PERIODOS = [
      { desde: 2020, hasta: 2021, n: 'Pandemia de COVID-19', corto: 'COVID-19' },
      { desde: 2024, hasta: 2027, n: 'Gobierno nacional de Javier Milei', corto: 'Gob. Milei' },
    ];
    PERIODOS.forEach((p) => {
      const i0 = datos.findIndex((x) => x.anio === p.desde),
        i1 = datos.findIndex((x) => x.anio === p.hasta);
      if (i0 < 0 || i1 < 0) return;
      const x0 = m.l + paso * i0 + 3,
        x1 = m.l + paso * (i1 + 1) - 3;
      sv(
        'rect',
        { class: 'periodo', x: x0, y: m.t - 30, width: x1 - x0, height: yv(0) - (m.t - 30), rx: 6 },
        svg,
      );
      const t = sv('text', { class: 'periodo-t', x: x0 + 9, y: m.t - 12 }, svg);
      t.textContent = p.n;
      if (t.getComputedTextLength() > x1 - x0 - 14) t.textContent = p.corto;
    });
    datos.forEach((d, i) => {
      const cx = m.l + paso * i + paso / 2;
      const x = cx - ancho / 2;
      const fill =
        d.tipo === 'presupuesto'
          ? '#4FC3E6'
          : d.tipo === 'presupuesto_2026'
            ? 'url(#rayado)'
            : '#5E7FAE';
      const col = sv(
        'rect',
        {
          class: 'col',
          x,
          width: ancho,
          y: yv(d.v),
          height: Math.max(0, yv(0) - yv(d.v)),
          rx: 3,
          fill,
        },
        svg,
      );
      col.style.animationDelay = i * 70 + 'ms';
      col.addEventListener('pointermove', (e) =>
        mostrarGlobo(
          e,
          String(d.anio) +
            (d.tipo === 'presupuesto_2026'
              ? ' (presupuesto aprobado)'
              : d.tipo === 'presupuesto'
                ? ' (presupuesto)'
                : ''),
          MF(d.v) +
            (ph ? ' por habitante' : '') +
            (real ? ' en pesos de 2027' : ' en pesos de ese año'),
        ),
      );
      col.addEventListener('pointerleave', ocultarGlobo);
      const val = sv('text', { class: 'val', x: cx, y: yv(d.v) - 8, 'text-anchor': 'middle' }, svg);
      const mm = d.v / 1e6;
      const corto = W < 640;
      val.textContent = ph
        ? nf0.format(d.v / 1000)
        : corto
          ? nf1.format(mm / 1000)
          : nf0.format(mm);
      if (corto) val.setAttribute('font-size', '11.5');
      const an = sv('text', { class: 'anio', x: cx, y: H - 8, 'text-anchor': 'middle' }, svg);
      an.textContent = W < 420 ? "'" + String(d.anio).slice(2) : d.anio;
    });
    if (MOV && document.getElementById('evolucion').classList.contains('visto')) {
      $$('#evo-grafico .val').forEach((t) => {
        const txt = t.textContent;
        const dec = txt.includes(',') ? 1 : 0;
        const n = parseFloat(txt.replace(/\./g, '').replace(',', '.'));
        const f = new Intl.NumberFormat('es-AR', {
          minimumFractionDigits: dec,
          maximumFractionDigits: dec,
        });
        if (isFinite(n)) tween(t, 0, n, (x) => f.format(x), 1000);
      });
    }
    const u = sv('text', { x: 0, y: 12 }, svg);
    u.textContent = ph
      ? 'Miles de pesos por habitante' + (real ? ', en pesos de 2027' : ', de cada año')
      : (W < 640 ? 'Miles de millones' : 'Millones') +
        (real ? ' de pesos de 2027' : ' de pesos de cada año');

    // lectura
    const v27 = datos.find((d) => d.anio === 2027).v;
    const v26 = datos.find((d) => d.anio === 2026).v;
    const v25 = datos.find((d) => d.anio === 2025).v;
    const pico = datos.filter((d) => d.anio < 2027).reduce((a, b) => (b.v > a.v ? b : a));
    const lect = $('#evo-lectura');
    lect.replaceChildren();
    const pl = def.pl;
    const cambio = (a, b) => {
      const x = a / b - 1;
      return P(Math.abs(x)) + (x >= 0 ? (pl ? ' mayores' : ' mayor') : pl ? ' menores' : ' menor');
    };
    if (real) {
      const nombre = def.n;
      lect.append(
        'Descontada la inflación, ' +
          nombre +
          ' previst' +
          (pl ? (def.f2 ? 'as' : 'os') : 'o') +
          ' para 2027 ' +
          (pl ? 'son ' : 'es '),
      );
      el('strong', null, cambio(v27, v26), lect);
      lect.append(' que el presupuesto aprobado para 2026 y ');
      el('strong', null, cambio(v27, v25), lect);
      lect.append(
        ' que lo ejecutado en 2025. El año más alto de la serie fue ' +
          pico.anio +
          ', con ' +
          MF(pico.v) +
          (ph ? ' por habitante' : '') +
          ' en pesos de 2027.',
      );
    } else {
      lect.append(
        'En pesos de cada año los montos parecen crecer siempre: de ' +
          MF(datos[0].v) +
          ' en 2019 a ' +
          MF(v27) +
          ' en 2027. Es casi todo inflación. ',
      );
      el('strong', null, 'Desactivá el interruptor para ver la comparación real.', lect);
    }
  }

  /* ---------- personal ---------- */
  const persArea = new Map();
  G.filter((r) => r.inciso === 1).forEach((r) => {
    const a = persArea.get(r.jurisdiccion) || { n: r.jurisdiccion, costo: 0, perm: 0, temp: 0 };
    a.costo += r.importe;
    persArea.set(r.jurisdiccion, a);
  });
  C.forEach((c) => {
    const a = persArea.get(c.jurisdiccion);
    if (a) a[c.tipo === 'permanente' ? 'perm' : 'temp'] += c.cargos;
  });
  const totPerm = sum(
    C.filter((c) => c.tipo === 'permanente'),
    (c) => c.cargos,
  );
  const totTemp = sum(
    C.filter((c) => c.tipo !== 'permanente'),
    (c) => c.cargos,
  );
  $('#personal-lectura').textContent =
    'El presupuesto prevé ' +
    nf0.format(totPerm) +
    ' cargos permanentes y ' +
    nf0.format(totTemp) +
    ' temporarios. El personal se lleva ' +
    P(pers / totGas) +
    ' del gasto, ' +
    M(pers) +
    ' en el año.';
  const gente = $('#gente');
  [...persArea.values()]
    .sort((a, b) => b.perm + b.temp - (a.perm + a.temp))
    .forEach((a) => {
      const box = el('div', 'area-g', null, gente);
      const h = el('header', null, null, box);
      el('b', null, areaCorto(a.n), h);
      el('span', null, nf0.format(a.perm + a.temp) + ' cargos · ' + M(a.costo), h);
      const pts = el('div', 'puntos', null, box);
      pts.style.setProperty('--c', areaC(a.n));
      pts.setAttribute('role', 'img');
      pts.setAttribute('aria-label', a.perm + ' permanentes y ' + a.temp + ' temporarios');
      for (let i = 0; i < a.perm; i++) el('i', null, null, pts);
      for (let i = 0; i < a.temp; i++) el('i', 't', null, pts);
    });
  const deuda = groupSum(
    G.filter((r) => r.inciso === 7),
    (r) => r.programa,
  );
  const dTot = sum(deuda, (d) => d[1]);
  $('#deuda-txt').textContent =
    'Se destinan ' +
    M(dTot) +
    ' a deuda, ' +
    P(dTot / totGas) +
    ' del presupuesto. ' +
    deuda
      .sort((a, b) => b[1] - a[1])
      .map(([n, v]) => n + ': ' + M(v))
      .join('. ') +
    '. La deuda flotante son pagos pendientes a proveedores de ejercicios anteriores; la consolidada corresponde al régimen de desendeudamiento del Decreto 259/12.';

  /* ---------- índice activo ---------- */
  const enlaces = $$('.indice a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting)
            enlaces.forEach((a) => {
              const on = a.getAttribute('href') === '#' + e.target.id;
              a.classList.toggle('activo', on);
              if (on) {
                const nav = a.parentElement;
                nav.scrollTo({
                  left: Math.max(0, a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2),
                  behavior: 'smooth',
                });
              }
            });
        }),
      { rootMargin: '-35% 0px -60% 0px' },
    );
    [
      'calculadora',
      'recursos',
      'tasas',
      'recorrido',
      'gastos',
      'programas',
      'cambios',
      'evolucion',
      'milei',
      'municipios',
      'personal',
      'datos',
    ].forEach((id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  const btnImp = $('#imprimir');
  if (btnImp) btnImp.addEventListener('click', () => window.print());

  /* ---------- íconos de secciones y descargas ---------- */
  const ICO_SEC = {
    recursos: 'landmark',
    tasas: 'receipt',
    recorrido: 'workflow',
    gastos: 'wallet',
    programas: 'layout-grid',
    cambios: 'git-compare-arrows',
    evolucion: 'trending-up',
    milei: 'trending-down',
    municipios: 'map',
    personal: 'users',
    datos: 'database',
  };
  Object.entries(ICO_SEC).forEach(([id, n]) => {
    const h2 = document.querySelector('#' + id + ' h2');
    if (h2) ico(n, h2, 'ico-sec');
  });
  $$('.descargas li').forEach((li, i, all) =>
    ico(
      i === all.length - 1 ? 'printer' : li.textContent.includes('QR') ? 'qr-code' : 'download',
      li,
      'ico-in',
    ),
  );

  /* ---------- animaciones (solo si el usuario no pidió reducir el movimiento) ---------- */
  // ?animar en la dirección las muestra aunque el sistema pida reducir el movimiento (para revisar)
  const conMovimiento =
    (!matchMedia('(prefers-reduced-motion: reduce)').matches ||
      new URLSearchParams(location.search).has('animar')) &&
    'IntersectionObserver' in window;
  const numeroDe = (s) => {
    const m = s.match(/-?[\d.]+(,\d+)?/);
    return m
      ? {
          txt: m[0],
          v: parseFloat(m[0].replace(/\./g, '').replace(',', '.')),
          dec: (m[1] || '').length ? m[1].length - 1 : 0,
        }
      : null;
  };
  function contar(e) {
    if (e.dataset.contando) return;
    e.dataset.contando = '1';
    const final = e.textContent;
    const n = numeroDe(final);
    if (!n || !isFinite(n.v) || n.v === 0) return;
    setTimeout(() => {
      e.textContent = final;
    }, 1900); // por si el navegador pausa la animación
    const f = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: n.dec,
      maximumFractionDigits: n.dec,
    });
    const t0 = performance.now();
    const dur = 1600;
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const k = 1 - Math.pow(1 - p, 4);
      e.textContent = final.replace(n.txt, f.format(n.v * k));
      if (p < 1) requestAnimationFrame(paso);
      else e.textContent = final;
    };
    requestAnimationFrame(paso);
  }
  if (conMovimiento) {
    document.documentElement.classList.add('anim');
    const CONTAR =
      '.bajada strong, .ph-cifra b, .cmp-v, .dp-v, .quien-cien b, .lg .n > span:first-child, .fila-top .vm, .ql-v, .ind-v, .tasa-m b, .pila-l b, .fl-v, .lp-m, #evo-grafico .val, .mil-v span:last-child, .mil-col-v';
    const ioA = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('visto');
          ioA.unobserve(en.target);
          en.target.querySelectorAll(CONTAR).forEach(contar);
        }),
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    $$('.apertura, .cap').forEach((s) => ioA.observe(s));
    // resguardo: si el observador se demora, mostrar igual lo que ya está en pantalla
    const revisar = () =>
      $$('.apertura:not(.visto), .cap:not(.visto)').forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < innerHeight * 0.92 && r.bottom > 0) {
          s.classList.add('visto');
          s.querySelectorAll(CONTAR).forEach(contar);
        }
      });
    addEventListener('scroll', revisar, { passive: true });
    const vigia = setInterval(() => {
      revisar();
      if (!document.querySelector('.cap:not(.visto)')) clearInterval(vigia);
    }, 700);
    // índice de cada elemento dentro de su lista, para la cascada
    const LISTAS =
      '.fila, .quien, .quien-lista li, .tasa, .ind, .nov-lista li, .ad, .dp, .cmp, .area-g, .lp-grupo, .seg-f, .descargas li, .glosario > div, .lg > div, .pila, .ph-cifra, .ejemplos li, .evo-notas p, .ticket-lineas li, .mapa .grupo';
    const escalonarItems = () =>
      $$(LISTAS).forEach((e) => {
        let i = 0,
          s = e;
        while ((s = s.previousElementSibling)) i++;
        e.style.setProperty('--i', Math.min(i, 14));
      });
    escalonarItems();
    let pendiente;
    new MutationObserver(() => {
      clearTimeout(pendiente);
      pendiente = setTimeout(escalonarItems, 30);
    }).observe($('main'), { childList: true, subtree: true });
    // barra de lectura y profundidad de la apertura
    const raiz = document.documentElement;
    const ap = $('.apertura');
    let pedido = false;
    const alDesplazar = () => {
      pedido = false;
      const max = raiz.scrollHeight - innerHeight;
      raiz.style.setProperty('--prog', max > 0 ? (scrollY / max).toFixed(4) : 0);
      if (scrollY < innerHeight * 1.5) ap.style.setProperty('--sy', scrollY.toFixed(1));
    };
    addEventListener(
      'scroll',
      () => {
        if (!pedido) {
          pedido = true;
          requestAnimationFrame(alDesplazar);
        }
      },
      { passive: true },
    );
    alDesplazar();
    // las columnas de la evolución suben de a una
    addEventListener('beforeprint', () =>
      $$('.apertura, .cap').forEach((s) => s.classList.add('visto')),
    );
  }
  /* ---------- portada: brillo que sigue al mouse ---------- */
  (function luzPortada() {
    const ap = $('.apertura');
    if (!ap || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let pendiente = false;
    let ev = null;
    ap.addEventListener('pointermove', (e) => {
      ev = e;
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        const r = ap.getBoundingClientRect();
        ap.style.setProperty('--mx', ev.clientX - r.left + 40 + 'px');
        ap.style.setProperty('--my', ev.clientY - r.top + 'px');
        ap.classList.add('con-luz');
        pendiente = false;
      });
    });
    ap.addEventListener('pointerleave', () => ap.classList.remove('con-luz'));
  })();

  /* ---------- celular: menú de secciones, volver arriba y bloques plegables ---------- */
  (function navegacionCelular() {
    const btn = $('#menu-btn');
    const indice = $('#indice');
    const cerrar = () => {
      document.body.classList.remove('menu-abierto');
      btn.setAttribute('aria-expanded', 'false');
    };
    btn.addEventListener('click', () => {
      const abierto = document.body.classList.toggle('menu-abierto');
      btn.setAttribute('aria-expanded', String(abierto));
    });
    indice.addEventListener('click', (e) => {
      if (e.target.closest('a')) cerrar();
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrar();
    });

    const arriba = $('#arriba');
    const verArriba = () => arriba.classList.toggle('visible', scrollY > 1400);
    addEventListener('scroll', verArriba, { passive: true });
    verArriba();

    const celular = matchMedia('(max-width: 760px)');
    // bloques enteros que se pliegan detrás de un botón
    $$('[data-plegar]').forEach((b) => {
      const t = el('button', 'ver-mas', null);
      t.type = 'button';
      el('span', null, b.dataset.plegar, t);
      ico('chevron-down', t);
      b.before(t);
      t.addEventListener('click', () => {
        b.classList.remove('plegado');
        t.remove();
      });
      const aplicar = () => {
        if (!t.isConnected) return;
        b.classList.toggle('plegado', celular.matches);
        t.hidden = !celular.matches;
      };
      celular.addEventListener('change', aplicar);
      aplicar();
    });
    // listas que muestran solo los primeros elementos
    $$('[data-recortar]').forEach((l) => {
      const n = Number(l.dataset.recortar);
      l.style.setProperty('--recorte', n);
      const t = el('button', 'ver-mas', null);
      t.type = 'button';
      el('span', null, l.dataset.recortarTxt, t);
      ico('chevron-down', t);
      l.after(t);
      t.addEventListener('click', () => {
        l.classList.remove('recortado');
        t.remove();
      });
      const aplicar = () => {
        if (!t.isConnected) return;
        const sobra = l.children.length > n;
        l.classList.toggle('recortado', celular.matches && sobra);
        t.hidden = !(celular.matches && sobra);
      };
      celular.addEventListener('change', aplicar);
      aplicar();
    });
  })();
  iconos();

  /* ---------- dibujo inicial y al cambiar el ancho ---------- */
  function todo() {
    recorrido();
    dibujarMapa();
    ficha();
    tabla();
    evolucion();
  }
  todo();
  let anchoPrevio = innerWidth;
  let t;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - anchoPrevio) < 8) return;
    anchoPrevio = innerWidth;
    clearTimeout(t);
    t = setTimeout(() => {
      recorrido();
      dibujarMapa();
      evolucion();
    }, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => dibujarMapa());
})();
