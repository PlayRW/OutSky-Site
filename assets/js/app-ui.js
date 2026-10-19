// Живой макет приложения OutSky на демо-данных: окно Windows и телефон-зеркало. Без библиотек и внешних запросов.
// Без JS виден статичный снимок «Подключено» (разметка). ?shot и reduced motion — тот же снимок без бегущих чисел. Тексты — по <html lang>.

// ===== окно Windows =====
// Наружу: html[data-os-state], события os:state (смена состояния), os:tick (раз в секунду) и os:pings (перерисованы таблетки);
// слушает osw:toggle (кнопка телефона).
(() => {
  const root = document.querySelector('.os-ui.osw'); if (!root) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const shot = /[?&]shot/.test(location.search);
  if (shot) document.documentElement.classList.add('shot');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];

  const T = {
    ru: { ms: 'мс', na: 'н/д', tap: 'Нажмите для подключения', connect: 'Подключить', disconnect: 'Отключить',
          kick: { off: 'Не подключено', connecting: 'Подключение…', on: 'Подключено', err: 'Нет соединения' },
          errTitle: 'Сервер не ответил', errSub: 'попробуйте другой сервер', now: 'Сейчас: ', mb: 'МБ', gb: 'ГБ', dec: ',',
          routes: ['Россия напрямую', 'Всё через VPN', 'Свои правила'], fold: 'Свернуть меню', unfold: 'Развернуть меню',
          speed: 'Скорость', speedRun: 'Тест…', testing: 'тест…', noReply: 'нет ответа', mbit: 'Мбит/с',
          names: { jp: 'Япония', ca: 'Канада', pl: 'Польша', sg: 'Сингапур', at: 'Австрия', it: 'Италия', es: 'Испания', br: 'Бразилия', in: 'Индия', ar: 'Аргентина' } },
    en: { ms: 'ms', na: 'n/a', tap: 'Tap to connect', connect: 'Connect', disconnect: 'Disconnect',
          kick: { off: 'Not connected', connecting: 'Connecting…', on: 'Connected', err: 'No connection' },
          errTitle: 'Server didn’t respond', errSub: 'try another server', now: 'Now: ', mb: 'MB', gb: 'GB', dec: '.',
          routes: ['Russia direct', 'Everything via VPN', 'Custom rules'], fold: 'Collapse menu', unfold: 'Expand menu',
          speed: 'Speed', speedRun: 'Testing…', testing: 'testing…', noReply: 'no reply', mbit: 'Mbps',
          names: { jp: 'Japan', ca: 'Canada', pl: 'Poland', sg: 'Singapore', at: 'Austria', it: 'Italy', es: 'Spain', br: 'Brazil', in: 'India', ar: 'Argentina' } }
  }[lang];

  const FL = {
    jp: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/></svg>',
    ca: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#d52b1e"/><rect x="22.5" width="7.5" height="20" fill="#d52b1e"/><path d="M15 5l1.4 3 2.6-1-1 3.6 2-.6-2 3h-2.2v2.5h-1.6V13H12l-2-3 2 .6-1-3.6 2.6 1z" fill="#d52b1e"/></svg>',
    pl: '<svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#dc143c"/></svg>',
    sg: '<svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#ef3340"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="7" cy="5" r="3" fill="#fff"/><circle cx="8.2" cy="5" r="3" fill="#ef3340"/></svg>',
    at: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#ed2939"/><rect y="6.7" width="30" height="6.6" fill="#fff"/></svg>',
    it: '<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/></svg>',
    es: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/></svg>',
    br: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#009c3b"/><path d="M15 3 27 10 15 17 3 10z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.2" fill="#002776"/></svg>',
    in: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#ff9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/><circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".8"/></svg>',
    ar: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#74acdf"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="2" fill="#f6b40e"/></svg>'
  };
  // Выдуманные серверы — ничего из реальной инфраструктуры. Порядок = data-i строк (на него опираются телефон и глобус).
  const S = [
    { f: 'jp', s: '', pr: 'VLESS', d: 'TCP · REALITY', k: 'v', ping: 38, sp: 120 },
    { f: 'jp', s: ' HY2', pr: 'Hysteria2', d: 'TLS', k: 'h', ping: 41, sp: 210 },
    { f: 'ca', s: '', pr: 'VLESS', d: 'XHTTP · REALITY', k: 'v', ping: 64, sp: 95 },
    { f: 'pl', s: '', pr: 'AmneziaWG', d: 'UDP', k: 'o', ping: 640, sp: 14 },
    { f: 'sg', s: '', pr: 'Trojan', d: 'WS · TLS', k: 'o', ping: 212, sp: 48 },
    { f: 'at', s: '', pr: 'Shadowsocks', d: '2022', k: 'o', ping: null, sp: null },
    { f: 'it', s: '', pr: 'VLESS', d: 'TCP · REALITY', k: 'v', ping: 57, sp: 140 },
    { f: 'es', s: '', pr: 'Hysteria2', d: 'TLS', k: 'h', ping: 83, sp: 176 },
    { f: 'br', s: '', pr: 'VLESS', d: 'gRPC · REALITY', k: 'v', ping: 188, sp: 62 },
    { f: 'in', s: '', pr: 'Trojan', d: 'WS · TLS', k: 'o', ping: 134, sp: 71 },
    { f: 'ar', s: '', pr: 'Shadowsocks', d: '2022', k: 'o', ping: 233, sp: 38 }
  ];
  S.forEach(s => s.b = s.ping);
  const name = s => T.names[s.f] + s.s;
  // пинг: < 60 — отлично, < 150 — норма, 150–500 — жёлтый, > 500 — красный, нет ответа — н/д
  const q = p => p == null ? 'na' : p < 60 ? 'q1' : p < 150 ? 'q2' : p <= 500 ? 'q3' : 'q4';
  const pingTxt = p => p == null ? T.na : `${p} ${T.ms}`;
  const subOn = s => `${s.pr} · ${s.d} · ${pingTxt(s.ping)}`;   // подзаголовок «Подключено»: протокол и тот же пинг, что в полоске и списке

  let state = 'on', sel = 0, flt = 'all', route = 0, t0 = 0, mb = 0, tmr = 0, cto = 0, auto = 0;

  // ---- список серверов ----
  const rows = $('#oswRows');
  // Справа в строке — ОДНА таблетка фиксированной ширины: показывает то, что мерили последним —
  // пинг (кнопка «Пинг» сверху) или скорость (кнопка «Скорость»). Ничего не съезжает при смене.
  rows.innerHTML = S.map((s, i) => `<div class="osw-row" data-i="${i}" role="button" tabindex="0"><span class="osw-fl">${FL[s.f]}</span><div class="osw-g"><b>${name(s)}</b><small><i>${s.pr}</i> · ${s.d}</small></div><span class="osw-ping"></span></div>`).join('');
  const rowEls = $$('#oswRows .osw-row');
  const fastest = () => S.reduce((b, s, i) => s.ping != null && (b < 0 || s.ping < S[b].ping) ? i : b, -1);
  const pinging = new Set();
  let view = 'ping', speedBusy = false;                                 // что показывают таблетки: 'ping' | 'speed'
  const spdCls = v => v === undefined ? 'wait' : v === 'run' ? 'busy' : v === null ? 'na' : 'sp';
  const spdTxt = v => v === undefined ? '—' : v === 'run' ? T.testing : v === null ? T.noReply : `${v} ${T.mbit}`;
  // alt — курсор (или фокус) на строке: таблетка показывает «другое» значение — пинг в режиме скорости,
  // скорость в режиме пинга (если её уже мерили)
  const hasSpd = s => typeof s.spd === 'number' || s.spd === null;
  function paintPill(p, s, busy, alt) {
    const showSpeed = alt && !speedBusy ? view === 'ping' && hasSpd(s) : view === 'speed';
    const a = alt && !speedBusy && (view === 'speed' || hasSpd(s)) ? ' alt' : '';
    if (showSpeed) { p.className = 'osw-ping ' + spdCls(s.spd) + a; p.textContent = spdTxt(s.spd); }
    else { p.className = 'osw-ping ' + (busy ? 'busy ' : '') + q(s.ping) + a; p.textContent = pingTxt(s.ping); }
  }
  function setView(v) {
    view = v;
    $$('.osw-tool').forEach(b => { const on = b.dataset.act === (v === 'ping' ? 'reping' : 'speed'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  let hov = -1;                                                         // строка под курсором / в фокусе
  function paintPings() {
    rowEls.forEach((el, i) => paintPill(el.querySelector('.osw-ping'), S[i], pinging.has(i), i === hov));
    const f = fastest();
    $('#oswFastSub').textContent = T.now + name(S[f]);
    paintPill($('#oswFastPing'), S[f], pinging.size > 0);
    if (state === 'on') {
      const s = S[sel], p = $('#oswPing'); p.className = 'osw-v ' + q(s.ping); p.innerHTML = s.ping == null ? '—' : `${s.ping} <small>${T.ms}</small>`;
      $('#oswSub').textContent = subOn(s);
    }
    document.dispatchEvent(new CustomEvent('os:pings'));
  }
  function paintFilter() { rowEls.forEach((el, i) => { el.hidden = !(flt === 'all' || S[i].k === flt); }); }

  // ---- график: 48 точек, новая раз в секунду ----
  const N = 48, W = 452, H = 58, MX = 140, dn = [], up = [];
  let ph = 1.3, seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // свой ГПСЧ: снимки ?shot одинаковые
  const gen = () => { ph += .35; return [84 + 18 * Math.sin(ph) + 9 * Math.sin(ph * 2.3 + 1) + (rnd() - .5) * 14, 23 + 6 * Math.sin(ph * .8 + 2) + (rnd() - .5) * 5]; };
  for (let i = 0; i < N; i++) { const [a, b] = gen(); dn.push(a); up.push(b); }
  const X = i => (i * W / (N - 1)).toFixed(1), Y = v => (H - Math.max(0, v) / MX * H).toFixed(1);
  const path = a => a.map((v, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(v)).join('');
  function drawChart() {
    const d = path(dn);
    $('.osw-chart .dn').setAttribute('d', d);
    $('.osw-chart .ar').setAttribute('d', d + `L${W} ${H}L0 ${H}Z`);
    $('.osw-chart .up').setAttribute('d', path(up));
    $('.osw-chart .now').setAttribute('cy', Y(dn[N - 1]));
    $('#oswDn').textContent = state === 'on' ? Math.round(dn[N - 1]) : 0;
    $('#oswUp').textContent = state === 'on' ? Math.round(up[N - 1]) : 0;
  }

  const f2 = n => String(n).padStart(2, '0');
  const hms = s => `${f2(Math.floor(s / 3600))}:${f2(Math.floor(s / 60) % 60)}:${f2(s % 60)}`;
  const vol = m => m < 1000 ? `${Math.round(m)} <small>${T.mb}</small>` : `${(m / 1024).toFixed(1).replace('.', T.dec)} <small>${T.gb}</small>`;
  function tick() {
    const [a, b] = gen(); dn.shift(); up.shift(); dn.push(a); up.push(b);
    mb += a / 8;
    $('#oswTm').textContent = hms(Math.floor((Date.now() - t0) / 1000));
    $('#oswTr').innerHTML = vol(mb);
    drawChart();
    document.dispatchEvent(new CustomEvent('os:tick'));
  }

  // ---- состояние ----
  function render() {
    root.classList.remove('st-off', 'st-connecting', 'st-on', 'st-err'); root.classList.add('st-' + state);
    const s = S[sel];
    // Статус — классический: «Подключено / Не подключено / Подключение… / Нет соединения».
    // Под кнопкой — выбранный сервер, ниже протокол и пинг.
    $('#oswKick').textContent = T.kick[state];
    $('#oswTitle').innerHTML = state === 'err' ? T.errTitle : `<span class="osw-fl">${FL[s.f]}</span>${name(s)}`;
    $('#oswSub').textContent = state === 'on' ? subOn(s)
      : state === 'connecting' ? `${s.pr} · ${s.d}`
      : state === 'err' ? `${name(s)} · ${s.pr} — ${T.errSub}` : T.tap;
    $('#oswPw').setAttribute('aria-label', state === 'off' || state === 'err' ? T.connect : T.disconnect);
    rowEls.forEach((el, i) => { el.classList.toggle('sel', i === sel); el.setAttribute('aria-pressed', i === sel); });
    if (state !== 'on') { $('#oswPing').className = 'osw-v'; $('#oswPing').textContent = '—'; if (state !== 'connecting') { $('#oswTm').textContent = '00:00:00'; $('#oswTr').innerHTML = `0 <small>${T.mb}</small>`; } }
    paintPings(); drawChart();
    document.documentElement.dataset.osState = state;
    document.dispatchEvent(new CustomEvent('os:state', { detail: { state, server: s.f } }));
  }
  function stop() { clearTimeout(cto); clearTimeout(auto); clearInterval(tmr); }
  function connect() {
    stop(); state = 'connecting'; render();
    cto = setTimeout(() => {
      if (state !== 'connecting') return;
      if (S[sel].ping == null) { state = 'err'; render(); return; }   // честный статус: сервер не ответил — не «Подключено»
      state = 'on'; t0 = Date.now(); mb = 0; render(); tick(); run();
    }, rmq.matches ? 40 : 1500);
  }
  // Живые обновления — время, график, скорость ↓↑, «дрожание» пинга — только пока первый экран рядом и вкладка видна.
  // Reduced motion — статичный снимок, как ?shot: нажатия работают, но числа сами не бегут.
  let near = true, jt = 0;
  function run() {
    clearInterval(tmr); clearInterval(jt); tmr = jt = 0;
    if (!near || document.hidden || rmq.matches) return;
    if (state === 'on') tmr = setInterval(tick, 1000);
    jt = setInterval(jitter, 3500);
  }
  // снимок «Подключено» (?shot и reduced motion): 00:42:17 и 1,2 ГБ; если анимации потом включат — отсчёт пойдёт с него
  function still() { state = 'on'; t0 = Date.now() - 2537e3; mb = 1250; $('#oswTm').textContent = hms(2537); $('#oswTr').innerHTML = vol(mb); render(); }
  function off() { stop(); state = 'off'; render(); }
  function pick(i) { sel = i; if (state === 'off') render(); else connect(); }

  root.addEventListener('click', e => {
    if (e.target.closest('#oswPw')) { (state === 'on' || state === 'connecting') ? off() : connect(); return; }
    if (e.target.closest('[data-fast]')) { pick(fastest()); return; }
    const r = e.target.closest('.osw-row[data-i]'); if (r) { pick(+r.dataset.i); return; }
    const f = e.target.closest('#oswFlt span'); if (f) { flt = f.dataset.f; $$('#oswFlt span').forEach(x => { x.classList.toggle('on', x === f); x.setAttribute('aria-pressed', x === f); }); paintFilter(); return; }
    const a = e.target.closest('[data-act]');
    if (a && a.dataset.act === 'retry') { connect(); return; }
    if (a && a.dataset.act === 'another') { sel = fastest(); connect(); return; }
    if (a && a.dataset.act === 'reping') { pingAll(); return; }
    if (a && a.dataset.act === 'speed') { if (!speedBusy) $('#oswAsk').hidden = !$('#oswAsk').hidden; return; }
    if (a && a.dataset.act === 'speed-run') { $('#oswAsk').hidden = true; speedAll(); return; }
    if (a && a.dataset.act === 'speed-cancel') { $('#oswAsk').hidden = true; return; }
    if (a && a.dataset.act === 'fold') { setMini(!root.classList.contains('mini')); return; }
    const m = e.target.closest('#oswMode [data-m]'); if (m) { setMode(+m.dataset.m); return; }
    if (e.target.closest('.osw-card[data-k=route]')) { route = (route + 1) % T.routes.length; $('#oswRoute').textContent = T.routes[route]; }
  });
  // Режим подключения внизу меню — «Прокси | Туннель» (системный прокси или TUN на всё устройство).
  // С маршрутизацией (карточка «Россия напрямую») не связан: правила работают в обоих режимах.
  function setMode(m) {
    $$('#oswMode [data-m]').forEach(x => { const on = +x.dataset.m === m; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    tabs();
  }
  function setMini(v) {
    root.classList.toggle('mini', v);
    const b = $('[data-act=fold]'); b.setAttribute('aria-expanded', !v); b.title = v ? T.unfold : T.fold;
    setTimeout(tabs, 320);                                              // меню сворачивается с переходом .28s
  }
  // Tab: что сейчас закрыто телефоном (он лежит поверх низа бокового меню), — вне Tab-цепочки, иначе фокус там
  // невидим (WCAG 2.4.11). Закрыто — больше четверти площади. «Прокси | Туннель» — roving tabindex: Tab попадает
  // только на выбранный режим, стрелки — между режимами; если телефон закрывает хоть один режим — вне цепочки вся группа.
  const phone = document.querySelector('.os-ui.osp');
  function tabs() {
    const pr = phone && phone.getClientRects().length ? phone.getBoundingClientRect() : null;
    const under = el => {
      if (!pr) return false;
      const r = el.getBoundingClientRect(), w = Math.min(r.right, pr.right) - Math.max(r.left, pr.left), h = Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top);
      return w > 0 && h > 0 && w * h > .25 * r.width * r.height;
    };
    const radios = $$('#oswMode [role=radio]'), mode = radios.some(under);
    $$('[role=button]').forEach(el => { el.tabIndex = under(el) ? -1 : 0; });
    radios.forEach(el => { el.tabIndex = !mode && el.getAttribute('aria-checked') === 'true' ? 0 : -1; });
  }
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(tabs); }, { passive: true });
  $$('#oswFlt span').forEach(el => { el.setAttribute('role', 'button'); el.setAttribute('aria-pressed', el.classList.contains('on')); });
  root.addEventListener('keydown', e => {
    const r = e.target.closest('#oswMode [role=radio]'), d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (r && d) { e.preventDefault(); const all = $$('#oswMode [role=radio]'), n = all[(all.indexOf(r) + d + all.length) % all.length]; setMode(+n.dataset.m); n.focus(); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('[role=button],[role=radio]'); if (!el || !root.contains(el)) return;
    e.preventDefault(); el.click();
  });

  // Пинг сам «дрожит» на ±1–4 мс (в приложении он меряется автоматически)
  const jit = s => { if (s.b != null) s.ping = Math.max(8, s.b + Math.round((Math.random() - .45) * 8)); };
  function jitter() { if (pinging.size) return; S.forEach(jit); paintPings(); }
  // Наведение на строку (или фокус с клавиатуры) — в таблетке «другое» значение: пинг вместо скорости и наоборот
  rowEls.forEach((el, i) => {
    const on = () => { hov = i; paintPings(); }, out = () => { if (hov === i) { hov = -1; paintPings(); } };
    el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', out);
    el.addEventListener('focus', on); el.addEventListener('blur', out);
  });
  // После теста скорость держится 20 с и сама меняется обратно на пинг. Отсчёт — тающая полоска на кнопке «Скорость»;
  // пока курсор (или фокус) в списке серверов, отсчёт на паузе — значения не сменятся, пока их читают
  const HOLD = 20000; let holdLeft = 0, holdAt = 0, holdT = 0, holdOn = false, inList = false;
  const sBtn = () => $('[data-act=speed]');
  function holdRun() { if (!holdOn || inList) return; holdAt = Date.now(); clearTimeout(holdT); holdT = setTimeout(holdEnd, holdLeft); sBtn().classList.remove('paused'); }
  function holdPause() { if (!holdOn) return; clearTimeout(holdT); holdLeft -= Date.now() - holdAt; sBtn().classList.add('paused'); }
  function holdStart() { holdOn = true; holdLeft = HOLD; const b = sBtn(); b.style.setProperty('--hold', HOLD / 1000 + 's'); b.classList.add('hold'); if (inList) holdPause(); else holdRun(); }
  function holdStop() { holdOn = false; clearTimeout(holdT); sBtn().classList.remove('hold', 'paused'); }
  function holdEnd() { holdStop(); setView('ping'); paintPings(); }
  const list = $('.osw-list');
  list.addEventListener('pointerenter', () => { inList = true; holdPause(); });
  list.addEventListener('pointerleave', () => { inList = false; holdRun(); });
  list.addEventListener('focusin', () => { inList = true; holdPause(); });
  list.addEventListener('focusout', e => { if (!list.contains(e.relatedTarget)) { inList = false; holdRun(); } });

  // «Пинг» сверху: таблетки снова показывают пинг и перемеряются все сразу — крутятся и обновляются по мере ответов
  function pingAll() {
    if (pinging.size || speedBusy) return;
    holdStop(); setView('ping');
    const btn = $('[data-act=reping]'); btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true');
    S.forEach((s, i) => pinging.add(i)); paintPings();
    S.forEach((s, i) => setTimeout(() => {
      jit(s); pinging.delete(i);
      if (!pinging.size) { btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); }
      paintPings();
    }, rmq.matches ? 30 : 300 + i * 140 + Math.random() * 260));
  }
  // «Скорость» сверху: после вопроса про трафик таблетки переключаются на скорость — сначала у всех «—»,
  // серверы проверяются по очереди (у текущего крутится кольцо), результат встаёт на место
  async function speedAll() {
    if (speedBusy || pinging.size) return; speedBusy = true;
    holdStop(); setView('speed'); S.forEach(s => { s.spd = undefined; }); paintPings();
    const btn = $('[data-act=speed]'), lbl = $('#oswSpeedLbl'); btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true'); lbl.textContent = T.speedRun;
    for (let i = 0; i < S.length; i++) {
      S[i].spd = 'run'; paintPings();
      await new Promise(r => setTimeout(r, rmq.matches ? 30 : 650));
      S[i].spd = S[i].sp == null ? null : Math.max(1, Math.round(S[i].sp * (.9 + Math.random() * .2))); paintPings();
    }
    speedBusy = false; btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); lbl.textContent = T.speed;
    paintPings(); holdStart();
  }
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#oswAsk').hidden) { $('#oswAsk').hidden = true; $('[data-act=speed]').focus(); } });

  // телефон рядом с окном — зеркало: его кнопка подключения нажимает кнопку окна
  document.addEventListener('osw:toggle', () => $('#oswPw').click());

  setView('ping'); paintFilter(); tabs();
  if (shot) { still(); return; }
  if (rmq.matches) still();
  else { state = 'off'; render(); auto = setTimeout(() => { if (state === 'off') connect(); }, 1100); }
  const hero = root.closest('[data-live]');
  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(es => { near = es[es.length - 1].isIntersecting; run(); }, { rootMargin: '200px 0px' }).observe(hero);
  else run();
  document.addEventListener('visibilitychange', run);
  rmq.addEventListener('change', run);
})();

// ===== телефон — живое зеркало окна =====
// Повторяет состояние, выбранный сервер, пинги (или скорость после теста), скорость ↑↓ и время из окна.
// Переключатель подключения нажимает кнопку окна (osw:toggle), строка сервера — строку окна, ⟳ — «Пинг» окна.
// На узких экранах окно скрыто, но продолжает работать — телефон остаётся живым.
// Пока окно видно, телефон — только зеркало: скрыт от скринридеров (aria-hidden) и вне Tab (tabindex=-1), мышью нажимается.
// inert не подходит — он отключил бы и клики. Окно скрыто (< 760) — телефон снова обычный: в Tab и в дереве доступности.
(() => {
  const ph = document.querySelector('.os-ui.osp'); if (!ph) return;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const $p = s => ph.querySelector(s), $$p = s => [...ph.querySelectorAll(s)];
  const ru = document.documentElement.lang !== 'en';
  const T = ru ? { tap: 'Нажмите для подключения', con: 'Подключение…', err: 'Сервер не ответил' }
               : { tap: 'Tap to connect', con: 'Connecting…', err: 'Server didn’t respond' };
  function sync() {
    const st = document.documentElement.dataset.osState; if (!st) return;
    ph.classList.remove('st-off', 'st-connecting', 'st-on', 'st-err'); ph.classList.add('st-' + st);
    // строки серверов: выбор и таблетка (пинг или скорость — как в окне)
    const wr = $$('#oswRows .osw-row');
    $$p('.osp-row').forEach(r => {
      const w = wr[+r.dataset.i]; if (!w) return;
      const was = r.classList.contains('sel'), now = w.classList.contains('sel'); r.classList.toggle('sel', now);
      if (now && !was) { const box = r.parentElement, top = r.offsetTop - box.offsetTop; if (top < box.scrollTop || top + r.offsetHeight > box.scrollTop + box.clientHeight - 30) box.scrollTop = Math.max(0, top - 40); }
      const wp = w.querySelector('.osw-ping'), pp = r.querySelector('.osp-pg');
      if (wp && pp) { pp.className = wp.className.replace('osw-ping', 'osp-pg').replace(' alt', ''); pp.textContent = wp.textContent; }
    });
    // плашка подключения
    const title = $('#oswTitle'), ct = $p('.osp-ct');
    if (ct && title) ct.innerHTML = st === 'on' ? title.innerHTML : st === 'connecting' ? T.con : st === 'err' ? T.err : T.tap;
    const up = $('#oswUp'), dn = $('#oswDn'), tm = $('#oswTm');
    if (up) $p('.osp-up').textContent = up.textContent;
    if (dn) $p('.osp-dn').textContent = dn.textContent;
    if (tm) $p('.osp-tm').textContent = tm.textContent;
    const wp = $('#oswPw'), pw = $p('[data-osp-pw]'); if (wp && pw) pw.setAttribute('aria-label', wp.getAttribute('aria-label'));
  }
  document.addEventListener('os:state', sync);
  document.addEventListener('os:tick', sync);
  document.addEventListener('os:pings', sync);
  // зеркало или единственный макет — по тому, видно ли окно
  const win = $('.os-ui.osw');
  let mirror = null;
  function setMirror() {
    const m = !!win && win.getClientRects().length > 0; if (m === mirror) return; mirror = m;
    if (m) ph.setAttribute('aria-hidden', 'true'); else ph.removeAttribute('aria-hidden');
    $$p('[role=button]').forEach(el => { el.tabIndex = m ? -1 : 0; });
    const sc = $p('.osp-rows'); if (sc) { if (m) sc.tabIndex = -1; else sc.removeAttribute('tabindex'); }   // прокручиваемый список без кнопок Chrome сам ставит в Tab
  }
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(setMirror); }, { passive: true });
  ph.addEventListener('mousedown', e => { if (mirror && e.target.closest('[role=button]')) e.preventDefault(); });   // клик мышью не уводит фокус в скрытое зеркало
  ph.addEventListener('click', e => {
    if (e.target.closest('[data-osp-pw]')) { document.dispatchEvent(new CustomEvent('osw:toggle')); return; }
    if (e.target.closest('[data-osp-act=reping]')) { const b = $('[data-act=reping]'); if (b) b.click(); return; }
    const r = e.target.closest('.osp-row[data-i]');
    if (r) { const w = $(`#oswRows .osw-row[data-i="${r.dataset.i}"]`); if (w) w.click(); sync(); }
  });
  ph.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('[role=button]'); if (!el || !ph.contains(el)) return;
    e.preventDefault(); el.click();
  });
  // своих таймеров нет: окно шлёт os:pings при каждой перерисовке таблеток (замер, «дрожание», скорость)
  setMirror(); sync();
})();
