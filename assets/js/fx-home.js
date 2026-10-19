// outsky.app — эффекты главной. ES-модуль, грузится лениво (core.js: data-fx). Без библиотек, слушатели пассивные. Тексты — по <html lang>.
// мини-интерактивы карточек · колода (01 сверху, уходят по очереди) · галерея (клик — к карточке) · глобус (Canvas 2D, 10 стран, точки кликабельны)
// · параллакс сцены. Меню и свечение у курсора — общие для страниц, sky.js.
const html = document.documentElement;
const shot = html.classList.contains('shot') || /[?&]shot/.test(location.search);
const rmq = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const wide = () => innerWidth >= 1100;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const P = { passive: true };
const save = !!(navigator.connection && navigator.connection.saveData);
const lowMem = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4;
const ru = html.lang !== 'en';
const how = () => (rmq.matches || shot ? 'instant' : 'smooth');

// ---- мини-интерактивы карточек ----
const feat = $('#features');
$$('.tg').forEach(el => { el.setAttribute('role', 'switch'); el.tabIndex = 0; el.setAttribute('aria-checked', el.classList.contains('on')); });
// маршруты (04) — радиогруппа: в порядке Tab только выбранный (roving tabindex), стрелки выбирают соседний
const rts = $$('.rt');
const pickRt = rt => rts.forEach(x => { const on = x === rt; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; });
rts.forEach(el => el.setAttribute('role', 'radio'));
if (rts.length) pickRt(rts.find(x => x.classList.contains('on')) || rts[0]);
document.addEventListener('click', e => {
  const t = e.target.closest('.tg');
  if (t) { const on = t.classList.toggle('on'); t.setAttribute('aria-checked', on); if (t.id === 'hwTg') $('#hwId').classList.toggle('off', !on); return; }
  if (e.target.closest('#hwReset')) {
    if ($('#hwId').classList.contains('off')) return;
    const h = () => Math.floor(Math.random() * 16).toString(16), g = n => Array.from({ length: n }, h).join('');
    $('#hwId code').textContent = `${g(8)}-${g(4)}-4${g(3)}-${g(4)}-…`; return;
  }
  const rt = e.target.closest('.rt');
  if (rt) pickRt(rt);
});
document.addEventListener('keydown', e => {
  const ar = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key], rk = ar && e.target.closest('.rt');
  if (rk) { e.preventDefault(); const n = rts[(rts.indexOf(rk) + ar + rts.length) % rts.length]; pickRt(n); n.focus(); return; }
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('.tg, .rt'); if (!el) return;
  e.preventDefault(); el.click();
});
// «Честный статус»: подсветка состояний по кругу — только пока секция в экране и без RM; в ?shot — «Подключено»
const st = $$('#states span');
if (st.length) {
  let si = 2; const paint = () => st.forEach((x, i) => x.classList.toggle('on', i === si)); paint();
  if (!shot && !rmq.matches) setInterval(() => { if (document.hidden || !feat || !feat.classList.contains('is-live')) return; si = (si + 1) % st.length; paint(); }, 1400);
}

// ---- колода: сверху (01), по прокрутке (01)…(04) уходят около .20/.40/.60/.80 прогресса (раскладка и веер — home.css), (05) — последняя ----
//      Номер и текст следующей карточки — когда уходящая уже освободила место (~77% ухода): тексты не наслаиваются
const track = $('.deck-track');
if (track) {
  const cards = $$('.card', track), idx = $$('.deck-idx li', track), num = $('.deck-num b', track), dots = $$('.deck-dots i', track);
  const topOf = p => 1 + [.235, .435, .635, .835].filter(t => p >= t).length;
  let cur = 0;
  const set = n => {
    if (n === cur) return; cur = n;
    if (num) num.textContent = '0' + n;
    cards.forEach((c, i) => { c.classList.toggle('top', i + 1 === n); c.classList.toggle('lit', i + 1 <= n); });
    idx.forEach((l, i) => l.classList.toggle('on', i + 1 === n));
    dots.forEach((d, i) => d.classList.toggle('on', i + 1 === n));
  };
  track.addEventListener('track:progress', e => set(topOf(e.detail)), P);
  set(1); track.classList.add('fx');
}

// ---- платформы: «Ваша система», изогнутый ряд (--d), клик — ряд едет к карточке, по центральной — её ссылка; кнопки ‹ › ----
const row = $('.gal-row');
if (row) {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : /Mac OS X/.test(ua) ? 'mac' : /Windows/.test(ua) ? 'windows' : /Linux/.test(ua) ? 'linux' : null;
  const items = [...row.children];
  const me = os && row.querySelector(`[data-os="${os}"]`);
  if (me) {
    const card = me.classList.contains('plc') ? me : $('.plc', me);
    card.classList.add('me');
    const b = document.createElement('span'); b.className = 'me-b'; b.textContent = ru ? 'Ваша система' : 'Your system'; card.append(b);
    const c = document.createElement('span'); c.className = 'comet'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<i></i>'; card.append(c);
  }
  const curve = !shot && !rmq.matches && matchMedia('(min-width:981px)').matches;   // на мобильном галерея плоская
  if (curve) { row.classList.add('curved'); row.parentElement.classList.add('is-curved'); }
  // куда прокрутить ряд, чтобы карточка встала в центр (с учётом краёв)
  const target = li => Math.max(0, Math.min(row.scrollWidth - row.clientWidth, li.offsetLeft - row.offsetLeft + li.offsetWidth / 2 - row.clientWidth / 2));
  const centered = li => Math.abs(target(li) - row.scrollLeft) < 6;
  const go = (li, b = how()) => row.scrollTo({ left: target(li), behavior: b });
  if (me) go(me, 'instant');
  let rq = 0;
  const bend = () => {
    rq = 0; const r = row.getBoundingClientRect();
    items.forEach(li => { const w = li.offsetWidth, x = li.offsetLeft - row.offsetLeft - row.scrollLeft + w / 2, d = (x - r.width / 2) / w; li.style.setProperty('--d', d.toFixed(3)); li.style.setProperty('--ad', Math.min(2, Math.abs(d)).toFixed(3)); });
  };
  if (curve) { row.addEventListener('scroll', () => { if (!rq) rq = requestAnimationFrame(bend); }, P); addEventListener('resize', () => { if (!rq) rq = requestAnimationFrame(bend); }, P); bend(); }
  // клик мышью/тапом: не центральная — ряд едет к ней (ссылку не открываем); центральная — ссылка работает сама.
  // «Центральная ли» запоминаем в момент нажатия: фокус от нажатия уже двигает ряд (в RM — мгновенно)
  let downLi = null, downC = false;
  row.addEventListener('pointerdown', e => { downLi = e.target.closest('.gal-row > li'); downC = !!downLi && centered(downLi); }, P);
  row.addEventListener('click', e => {
    const li = e.target.closest('.gal-row > li'); if (!li || e.detail === 0) return;   // клавиатура: фокус уже поставил карточку в центр
    const c = li === downLi ? downC : centered(li); downLi = null;
    if (c) return;
    e.preventDefault(); go(li);
  });
  // фокус с клавиатуры — карточку в центр
  row.addEventListener('focusin', e => { const li = e.target.closest('.gal-row > li'); if (li && !centered(li)) go(li); });
  const nearest = () => { let k = 0, best = 1e9; items.forEach((li, i) => { const d = Math.abs(target(li) - row.scrollLeft); if (d < best) { best = d; k = i; } }); return k; };
  const step = dir => go(items[Math.max(0, Math.min(items.length - 1, nearest() + dir))]);
  const pv = $('.gal-b.prev'), nx = $('.gal-b.next');
  if (pv) pv.addEventListener('click', () => step(-1));
  if (nx) nx.addEventListener('click', () => step(1));
}

// ---- глобус-созвездие: 700 точек (мобильный 350) на сфере Фибоначчи, ортопроекция, 10 стран демо-серверов, событие os:state ----
//      Точки стран кликабельны: клик выбирает в окне первый сервер страны, глобус поворачивается к ней (через os:state).
//      У каждой точки — подпись страны (свой canvas-слой, тот же кадр): едет с вращением, прозрачность — от глубины (у края
//      гаснет, на обороте скрыта), без наложений; под курсором и выбранная — «неоновая» плашка.
const gEl = $('.globe'), cv = gEl && $('canvas', gEl);
if (cv && cv.getContext) {
  const ctx = cv.getContext('2d');
  const mob = !wide() || !fine;
  const N = mob ? 350 : 700, FPS = mob ? 24 : 30;
  const still = shot || rmq.matches || save || (mob && lowMem);
  const D = Math.PI / 180, TK = .6;                                  // наклон к широте сервера — 0.6 от широты
  const C = { jp: [36, 138], ca: [56, -106], cz: [50.1, 14.4], sg: [1.3, 103.8], at: [47.5, 14.5], it: [42.5, 12.5], es: [40.4, -3.7], br: [-15.8, -47.9], in: [20.6, 79], ar: [-34.6, -58.4] };
  const NAME = ru ? { jp: 'Япония', ca: 'Канада', cz: 'Чехия', sg: 'Сингапур', at: 'Австрия', it: 'Италия', es: 'Испания', br: 'Бразилия', in: 'Индия', ar: 'Аргентина' }
                  : { jp: 'Japan', ca: 'Canada', cz: 'Czechia', sg: 'Singapore', at: 'Austria', it: 'Italy', es: 'Spain', br: 'Brazil', in: 'India', ar: 'Argentina' };
  const FIRST = { jp: 0, ca: 2, cz: 3, sg: 4, at: 5, it: 6, es: 7, br: 8, in: 9, ar: 10 };   // первый сервер страны — индекс S в app-ui.js
  const LINKS = [['jp', 'sg'], ['sg', 'in'], ['in', 'it'], ['it', 'at'], ['at', 'cz'], ['cz', 'ca'], ['ca', 'jp'], ['it', 'es'], ['es', 'br'], ['br', 'ar']];
  const ll = (a, b) => { a *= D; b *= D; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  const pts = new Float32Array(N * 3), ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), p = i * ga; pts[i * 3] = Math.cos(p) * r; pts[i * 3 + 1] = y; pts[i * 3 + 2] = Math.sin(p) * r; }
  const CP = {}; for (const k in C) CP[k] = ll(C[k][0], C[k][1]);
  const ARC = LINKS.map(([a, b]) => {
    const A = CP[a], B = CP[b], om = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))), out = [];
    for (let k = 0; k <= 24; k++) { const t = k / 24, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om), l = 1 + .06 * Math.sin(Math.PI * t);
      out.push([(A[0] * s1 + B[0] * s2) * l, (A[1] * s1 + B[1] * s2) * l, (A[2] * s1 + B[2] * s2) * l]); }
    return { a, b, out };
  });
  const aim = k => [-C[k][1] * D, C[k][0] * TK * D];
  let sel = 'jp', state = html.dataset.osState || 'on', hov = null;
  let [yaw, tilt] = aim('jp');
  let tw = null, base = null, swayT = 0, vy = 0, vt = 0, drag = null, mx = -1e4, my = -1e4;
  let W = 0, R = 0, dpr = 1, vis = true, run = false, last = 0, acc = 0, t0 = performance.now();
  const HP = [];                                                     // экранные координаты видимых стран (для клика)
  const ease = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);       // --e-expo
  const sm = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);    // smoothstep
  // подписи: F0 — спокойная, F1 — выделенная (в плашке). На каждую страну: f — глубина 0…1, v — «поставлена» 0…1 (сглажено),
  //   h — выделение 0…1 (сглажено), (x, y) — смещение центра подписи от точки (сглажено), s — сторона 0 справа · 1 слева · 2 сверху · 3 снизу
  const F0 = '500 12px Inter,system-ui,sans-serif', F1 = '600 12.5px Inter,system-ui,sans-serif';
  const LB = {}; for (const k in C) LB[k] = { f: 0, v: 0, h: 0, x: 0, y: 0, s: -1, w0: 0, w1: 0 };
  const VP = [], LX = [];                                            // видимые страны этого кадра; поставленные подписи (для клика)
  // Слой подписей — отдельный canvas поверх текста и дымки первого экрана (.hero-top::before гасит левый край глобуса):
  //   то же место, что у глобуса (класс .globe — те же правила раскладки, home.css), параллакс — копией transform
  let lb = null, lx = null, lbTf = '';
  let occ = [], vx0 = 0, vx1 = 0, lastL = 0;                        // перекрытия (окно, телефон, тексты) и видимая полоса по x — в координатах canvas
  const measure = () => { for (const k in LB) { ctx.font = F0; LB[k].w0 = ctx.measureText(NAME[k]).width; ctx.font = F1; LB[k].w1 = ctx.measureText(NAME[k]).width; } };
  function size() {
    const b = gEl.getBoundingClientRect(); W = Math.max(1, Math.round(b.width)); dpr = Math.min(devicePixelRatio || 1, 1.5); cv.width = cv.height = Math.round(W * dpr); R = W / 2 * .96;
    if (lb) { const c = lb.firstChild; c.width = c.height = cv.width; }
    // что лежит над глобусом: подписи туда не ставим (замер — при старте и resize). Окно/телефон/подпись сцены — запас 14px
    // (параллакс сдвигает их относительно глобуса до 12px), тексты первого экрана — 8px
    const box = (sel, m) => $$(sel).map(e => e.getBoundingClientRect()).filter(r => r.width && r.height).map(r => [r.left - b.left - m, r.top - b.top - m, r.right - b.left + m, r.bottom - b.top + m, m]);
    occ = [...box('.hero .w-box, .hero .p-box, .hero .cap', 14), ...box('.hero .tag, .hero .h1 .ln, .hero .lead, .hero .ctas, .hero .checks', 8)];
    vx0 = Math.max(4, 4 - b.left); vx1 = Math.min(W - 4, html.clientWidth - b.left - 6);   // справа глобус уходит за край экрана
    measure();
  }
  function go(k) {
    let [ty, tt] = aim(k); const dy = ((ty - yaw) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;   // кратчайший путь
    tw = { y0: yaw, t0v: tilt, dy, dt: tt - tilt, s: performance.now() }; base = null;
  }
  function draw(now) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), sn = Math.sin(tilt), c = W / 2;
    const pr = (x, y, z) => { const x1 = x * cy + z * sy, z1 = z * cy - x * sy; return [c + R * x1, c - R * (y * ct - z1 * sn), y * sn + z1 * ct]; };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, W);
    ctx.fillStyle = '#B5ABFC';
    const lens = !mob && mx > -1e3;
    for (let i = 0; i < N; i++) {
      const q = pr(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]), dp = (q[2] + 1) / 2;
      let rr = (.55 + 1.05 * dp) * (W / 640 + .35);
      if (lens) { const dx = q[0] - mx, dy = q[1] - my, d2 = dx * dx + dy * dy; if (d2 < 6400) rr *= 1 + 1.5 * (1 - Math.sqrt(d2) / 80); }    // лупа ×2.5, радиус 80px
      ctx.globalAlpha = .15 + .55 * dp; ctx.beginPath(); ctx.arc(q[0], q[1], rr, 0, 6.2832); ctx.fill();
    }
    // дуги-созвездия между странами
    ctx.lineWidth = 1.1; ctx.strokeStyle = '#B5ABFC';
    for (const A of ARC) {
      const hot = (A.a === sel || A.b === sel) && state === 'on';
      let pen = false; ctx.beginPath();
      for (const p of A.out) { const q = pr(p[0], p[1], p[2]); if (q[2] > -.05) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } else pen = false; }
      ctx.globalAlpha = hot ? .75 : .34; ctx.stroke();
    }
    // страны: кольца; выбранная — яркая, с пульсом 2.4s; под курсором — крупнее
    const ph = still ? .35 : ((now - t0) / 2400) % 1;
    HP.length = 0; VP.length = 0;
    for (const k in CP) {
      const q = pr(CP[k][0], CP[k][1], CP[k][2]); if (q[2] <= 0) continue;
      if (q[2] > .12) HP.push({ k, x: q[0], y: q[1] });
      VP.push({ k, x: q[0], y: q[1], z: q[2] });
      const a = .35 + .65 * q[2];
      if (k === sel) {
        const lit = state === 'on' ? 1 : state === 'connecting' ? .8 : .55;
        ctx.globalAlpha = a * .22 * lit; ctx.fillStyle = '#8E7BFF'; ctx.beginPath(); ctx.arc(q[0], q[1], 16, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = a * (1 - ph) * .8 * lit; ctx.strokeStyle = '#B5ABFC'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(q[0], q[1], 8 + ph * 18, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = a * lit; ctx.strokeStyle = state === 'err' ? '#F87171' : '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#B5ABFC';
      } else {
        const h = k === hov;
        if (h) { ctx.globalAlpha = a * .2; ctx.fillStyle = '#8E7BFF'; ctx.beginPath(); ctx.arc(q[0], q[1], 13, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#B5ABFC'; }
        ctx.globalAlpha = a * (h ? 1 : .8); ctx.strokeStyle = h ? '#E7E5FE' : '#B5ABFC'; ctx.lineWidth = h ? 1.8 : 1.5; ctx.beginPath(); ctx.arc(q[0], q[1], h ? 7.5 : 5.5, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = a * .9; ctx.beginPath(); ctx.arc(q[0], q[1], 1.6, 0, 6.2832); ctx.fill();
      }
    }
    labels(now);
    ctx.globalAlpha = 1;
  }
  // подписи стран — часть кадра draw, свой слой lx (≤10 fillText, без DOM и замеров раскладки)
  const pill = (x, y, w, h) => { const r = h / 2; lx.beginPath(); lx.arc(x - w / 2 + r, y, r, Math.PI / 2, Math.PI * 1.5); lx.arc(x + w / 2 - r, y, r, -Math.PI / 2, Math.PI / 2); lx.closePath(); };
  const inR = (x, y, list) => list.some(o => x > o[0] + o[4] && x < o[2] - o[4] && y > o[1] + o[4] && y < o[3] - o[4]);   // точка — по самой рамке, без запаса
  const over = (b, o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1];
  function labels(now) {
    if (!lx) return;
    const tf = gEl.style.transform; if (tf !== lbTf) { lbTf = tf; lb.style.transform = tf; }   // параллакс глобуса (fx ниже) — и слою подписей
    lx.setTransform(dpr, 0, 0, dpr, 0, 0); lx.clearRect(0, 0, W, W);
    // сглаживание по времени (τ 170/120 мс); без цикла (RM, ?shot, событие на паузе) — сразу к цели
    const dt = run && lastL ? Math.min(100, now - lastL) : 0; lastL = run ? now : 0;
    const kv = dt ? 1 - Math.exp(-dt / 170) : 1, kp = dt ? 1 - Math.exp(-dt / 120) : 1;
    const busy = [];                                                  // занято: кружки стран (метка — код страны) и поставленные подписи ('L')
    for (const p of VP) busy.push([p.x - 9, p.y - 9, p.x + 9, p.y + 9, p.k]);
    VP.sort((a, b) => (b.k === hov) - (a.k === hov) || (b.k === sel) - (a.k === sel) || b.z - a.z);   // приоритет: под курсором, выбранная, ближняя
    for (const k in LB) LB[k].f = 0;
    LX.length = 0;
    for (const p of VP) {
      const L = LB[p.k], hl = p.k === hov || p.k === sel, f = sm((p.z - .1) / .4);
      let put = null;
      L.f = f;
      if (f > 0 && !inR(p.x, p.y, occ)) {                               // точка под окном/телефоном — без подписи
        // у края подпись чуть дальше от точки — при повороте вперёд «подъезжает» к ней; выделенная — плашка 24px
        const w = hl ? L.w1 + 22 : L.w0 + 6, h = hl ? 24 : 16, g = (hl ? 14 : 10) + 8 * (1 - f);
        for (const s of [L.s, 0, 1, 2, 3]) {                             // сначала прежняя сторона — подписи не прыгают туда-сюда
          if (s < 0) continue;
          const cx = s === 0 ? p.x + g + w / 2 : s === 1 ? p.x - g - w / 2 : p.x, cy = s === 2 ? p.y - g * .8 - h / 2 : s === 3 ? p.y + g * .8 + h / 2 : p.y;
          const bx = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
          if (bx[0] < vx0 || bx[2] > vx1 || bx[1] < 4 || bx[3] > W - 4 || occ.some(o => over(bx, o))) continue;
          if (busy.some(o => (o[4] === 'L' || (!hl && o[4] !== p.k)) && over(bx, o))) continue;   // выделенной мешают только подписи
          put = { s, cx, cy, bx }; break;
        }
      }
      if (put) {
        const tx = put.cx - p.x, ty = put.cy - p.y; L.s = put.s; busy.push([...put.bx, 'L']);
        if (L.v < .02) { L.x = tx; L.y = ty; } else { L.x += (tx - L.x) * kp; L.y += (ty - L.y) * kp; }   // смена стороны — подпись переезжает
        if (L.v * f > .4) LX.push({ k: p.k, x: p.x, y: p.y, b: put.bx });
      }
      L.v += ((put ? 1 : 0) - L.v) * kv; L.h += ((hl ? 1 : 0) - L.h) * kv;
    }
    for (const k in LB) if (!LB[k].f) LB[k].v = 0;                     // ушла за край — снова появится плавно
    lx.textAlign = 'center'; lx.textBaseline = 'middle'; lx.lineJoin = 'round';
    for (let i = VP.length - 1; i >= 0; i--) {                          // младшие снизу, под курсором и выбранная — сверху
      const p = VP[i], L = LB[p.k], a = L.f * L.v; if (a < .01) continue;
      const x = p.x + L.x, y = p.y + L.y, c0 = a * (1 - L.h), c1 = a * L.h, t = NAME[p.k];
      if (c0 > .01) {                                                   // спокойная: светлый текст на тёмной обводке — читается и поверх точек
        lx.font = F0; lx.globalAlpha = c0 * .7; lx.lineWidth = 3; lx.strokeStyle = '#07081C'; lx.strokeText(t, x, y);
        lx.globalAlpha = c0 * .92; lx.fillStyle = '#D4CFFB'; lx.fillText(t, x, y);
      }
      if (c1 > .01) {                                                   // выделенная: плашка с неоновой каймой (выбранная — по состоянию, как кольцо)
        const lit = p.k === sel && p.k !== hov ? (state === 'on' ? 1 : state === 'connecting' ? .8 : .55) : 1;
        lx.globalAlpha = c1; lx.shadowColor = 'rgba(123,97,255,.85)'; lx.shadowBlur = 18 * lit; lx.fillStyle = 'rgba(13,11,36,.9)';
        pill(x, y, L.w1 + 22, 24); lx.fill(); lx.shadowBlur = 0;
        lx.globalAlpha = c1 * (.3 + .45 * lit); lx.strokeStyle = p.k === sel && state === 'err' ? '#F87171' : '#B5ABFC'; lx.lineWidth = 1; lx.stroke();
        lx.globalAlpha = c1; lx.font = F1; lx.fillStyle = '#fff'; lx.fillText(t, x, y + .5);
      }
    }
    lx.globalAlpha = 1;
  }
  function frame(now) {
    if (!run) return;
    requestAnimationFrame(frame);
    const dt = Math.min(100, now - (last || now)); last = now; acc += dt;
    if (acc < 1000 / FPS - 2) return;
    const s = acc / 1000; acc = 0;
    if (drag) {/* тянут — угол уже задан */}
    else if (Math.abs(vy) > .0004 || Math.abs(vt) > .0004) { yaw += vy; tilt = Math.max(-.45 * Math.PI, Math.min(.45 * Math.PI, tilt + vt)); vy *= .9; vt *= .9; if (Math.abs(vy) <= .0004 && Math.abs(vt) <= .0004 && (state === 'on' || state === 'connecting')) go(sel); }
    else if (tw) { const t = Math.min(1, (now - tw.s) / 1200), e = ease(t); yaw = tw.y0 + tw.dy * e; tilt = tw.t0v + tw.dt * e; if (t >= 1) { tw = null; base = yaw; swayT = 0; } }
    else if (state === 'on' || state === 'connecting') { if (base == null) { base = yaw; swayT = 0; } swayT += s; yaw = base + .14 * Math.sin(swayT * .35); }   // держит сервер в кадре, слегка покачиваясь
    else yaw += .06 * s;                                                                                                     // свободное вращение .06 рад/с
    draw(now);
  }
  const play = () => { const want = vis && !document.hidden && !still; if (want && !run) { run = true; last = 0; requestAnimationFrame(frame); } else if (!want) run = false; };
  document.addEventListener('os:state', e => {
    const d = e.detail || {}; const k = d.server in C ? d.server : sel; const prev = state; state = d.state || state;
    if (still) { sel = k; [yaw, tilt] = aim(k); if (W) draw(performance.now()); return; }
    if (k !== sel || (state !== prev && (state === 'on' || state === 'connecting'))) { sel = k; go(k); }
  });
  // ближайшая видимая страна под точкой (x, y) в координатах canvas; не попали в кружок — может, в её подпись
  const hit = (x, y, rad) => {
    let best = null, bd = rad * rad; for (const h of HP) { const d = (h.x - x) ** 2 + (h.y - y) ** 2; if (d < bd) { bd = d; best = h; } }
    return best || LX.find(l => x > l.b[0] - 5 && x < l.b[2] + 5 && y > l.b[1] - 3 && y < l.b[3] + 3) || null;   // запас 5px: плашка шире подписи, наведение не мигает
  };
  // выбрать страну: первый её сервер в окне (окно само шлёт os:state — глобус повернётся), список окна — к этой строке
  function pickCountry(k) {
    const r = document.querySelector(`#oswRows .osw-row[data-i="${FIRST[k]}"]`); if (!r) return;
    r.click();
    const box = r.parentElement, top = r.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + r.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTo({ top: Math.max(0, top - (box.clientHeight - r.offsetHeight) / 2), behavior: how() });
  }
  function start() {
    lb = document.createElement('div'); lb.className = 'globe g-lb'; lb.setAttribute('aria-hidden', 'true'); lb.append(document.createElement('canvas')); gEl.after(lb);
    lx = lb.firstChild.getContext('2d');
    size();
    // Inter для подписей: canvas не ждёт веб-шрифт сам — догружаем (кириллица — отдельный файл) и перерисовываем с новыми ширинами
    if (document.fonts && document.fonts.load) Promise.all([F0, F1].map(f => document.fonts.load(f, Object.values(NAME).join('')))).then(() => { measure(); if (!run) draw(performance.now()); }, () => {});
    // наведение: подпись страны становится плашкой (весь глобус — декор, aria-hidden: точки не мешают фокусу)
    const setHov = h => {
      const k = h ? h.k : null; cv.style.cursor = h ? 'pointer' : '';
      if (k !== hov) { hov = k; if (!run) draw(performance.now()); }
    };
    cv.style.pointerEvents = 'auto';
    // клик/тап по стране (не после перетаскивания)
    let down = null;
    cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; }, P);
    cv.addEventListener('click', e => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const b = cv.getBoundingClientRect(), h = hit(e.clientX - b.left, e.clientY - b.top, e.pointerType === 'mouse' || fine ? 14 : 22);
      if (h) pickCountry(h.k);
    });
    draw(performance.now()); gEl.classList.add('on'); lb.classList.add('on');   // первый кадр сразу, дальше — цикл rAF
    if (!still) {
      play();
      if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; play(); }).observe(gEl);
      document.addEventListener('visibilitychange', play);
    }
    addEventListener('resize', () => { size(); if (!run) draw(performance.now()); }, P);
    if (fine) {
      addEventListener('pointermove', e => {
        const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top;
        if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; vy = dx * .006; vt = dy * .006; yaw += vy; tilt = Math.max(-.45 * Math.PI, Math.min(.45 * Math.PI, tilt + vt)); tw = null; base = null; if (!run) draw(performance.now()); }
        setHov(!drag && e.target === cv ? hit(mx, my, 14) : null);    // глобус под окном/текстом не отвечает
      }, P);
      if (!mob) {
        // перетаскивание с инерцией (затухание .9) — только мышь, только видимая часть глобуса
        cv.addEventListener('pointerdown', e => { if (e.button !== 0) return; drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); }, P);
        const up = () => { drag = null; };
        cv.addEventListener('pointerup', up, P); cv.addEventListener('pointercancel', up, P);
      }
    }
  }
  const idle = cb => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 1200));
  const kick = () => (still ? start() : idle(start));   // неподвижный режим (RM, ?shot) — сразу, без ожидания простоя
  if (still || document.readyState === 'complete') kick(); else addEventListener('load', kick, { once: true });
}

// ---- параллакс сцены первого экрана: глобус ±12px, окно ±6px, телефон ±3px и наклон ±4° (только мышь, без RM) ----
if (fine && !shot && !rmq.matches) {
  const g = $('.globe'), w = $('.w-box'), ph = $('.p-box'), hero = $('.hero');
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, last = 0;
  const step = now => {
    raf = 0; const dt = Math.min(64, now - (last || now)); last = now; const k = 1 - Math.exp(-dt / 160);
    x += (tx - x) * k; y += (ty - y) * k;
    if (g) g.style.transform = `translate(${(-12 * x).toFixed(2)}px,${(-12 * y).toFixed(2)}px)`;
    if (w) w.style.transform = `translate(${(-6 * x).toFixed(2)}px,${(-6 * y).toFixed(2)}px)`;
    if (ph) ph.style.transform = `perspective(1000px) translate(${(-3 * x).toFixed(2)}px,${(-3 * y).toFixed(2)}px) rotateY(${(4 * x).toFixed(2)}deg) rotateX(${(-4 * y).toFixed(2)}deg)`;
    if (Math.abs(tx - x) > .002 || Math.abs(ty - y) > .002) raf = requestAnimationFrame(step); else last = 0;
  };
  addEventListener('pointermove', e => {
    if (!wide() || scrollY > hero.offsetHeight) return;
    tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1;
    if (!raf) raf = requestAnimationFrame(step);
  }, P);
}
