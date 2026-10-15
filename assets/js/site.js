// outsky.app — живой макет приложения, подсветка системы посетителя, меню, анимации.
// Без библиотек и внешних запросов. Тексты — по <html lang>.
(() => {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

  const T = {
    ru: { ms: 'мс', na: 'н/д', tap: 'Нажмите для подключения', connecting: 'Подключение…', noReply: 'сервер не ответил', ok: 'Трафик идёт · норма',
          connect: 'Подключить', disconnect: 'Отключить', yourOs: 'Ваша система',
          names: { jp: 'Япония', ca: 'Канада', pl: 'Польша', sg: 'Сингапур', at: 'Австрия' } },
    en: { ms: 'ms', na: 'n/a', tap: 'Tap to connect', connecting: 'Connecting…', noReply: 'server didn’t respond', ok: 'Traffic flows · OK',
          connect: 'Connect', disconnect: 'Disconnect', yourOs: 'Your system',
          names: { jp: 'Japan', ca: 'Canada', pl: 'Poland', sg: 'Singapore', at: 'Austria' } }
  }[lang];

  const FL = {
    jp: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/></svg>',
    ca: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#d52b1e"/><rect x="22.5" width="7.5" height="20" fill="#d52b1e"/><path d="M15 5l1.4 3 2.6-1-1 3.6 2-.6-2 3h-2.2v2.5h-1.6V13H12l-2-3 2 .6-1-3.6 2.6 1z" fill="#d52b1e"/></svg>',
    pl: '<svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#dc143c"/></svg>',
    sg: '<svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#ef3340"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="7" cy="5" r="3" fill="#fff"/><circle cx="8.2" cy="5" r="3" fill="#ef3340"/></svg>',
    at: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#ed2939"/><rect y="6.7" width="30" height="6.6" fill="#fff"/></svg>'
  };
  // Демо-данные: выдуманные серверы, ничего из реальной инфраструктуры.
  const S = [
    { f: 'jp', s: '', p: '<span class="v">VLESS</span> · TCP · <span class="r">REALITY</span>', k: 'v', ping: 38 },
    { f: 'jp', s: ' HY2', p: '<span class="h">Hysteria2</span> · <span class="l">TLS</span>', k: 'h', ping: 41 },
    { f: 'ca', s: '', p: '<span class="v">VLESS</span> · XHTTP · <span class="r">REALITY</span>', k: 'v', ping: 64 },
    { f: 'pl', s: '', p: '<span class="w">AmneziaWG</span> · UDP', k: 'o', ping: 71 },
    { f: 'at', s: '', p: '<span class="s">Shadowsocks</span> · 2022', k: 'o', ping: null },
    { f: 'sg', s: '', p: '<span class="t">Trojan</span> · WS · <span class="l">TLS</span>', k: 'o', ping: 212 }
  ];
  const name = s => T.names[s.f] + s.s;

  let sel = 0, state = 'off', t0 = 0, tmr = null, flt = 'all';
  const row = (s, i) => {
    const pg = s.ping == null ? `<span class="pg na">${T.na}</span>` : `<span class="pg"><i class="${s.ping > 200 ? 'y' : ''}"></i>${s.ping} ${T.ms}</span>`;
    return `<div class="srv ${i === sel ? 'sel' : ''}" data-i="${i}" role="button" tabindex="0"><span class="fl">${FL[s.f]}</span><div class="sv"><b>${name(s)}</b><div class="pr">${s.p}</div></div>${pg}</div>`;
  };

  function render() {
    const home = $('#home'); if (!home) return;
    $('#srvList').innerHTML = S.slice(0, 3).map(row).join('');
    $('#srvList2').innerHTML = S.map((s, i) => ({ s, i })).filter(o => flt === 'all' || o.s.k === flt).slice(0, 5).map(o => row(o.s, o.i)).join('');
    home.classList.remove('st-off', 'st-connecting', 'st-on', 'st-err'); home.classList.add('st-' + state);
    document.body.classList.toggle('on', state === 'on');
    const s = S[sel];
    $('#loc').innerHTML = state === 'on' ? `<span class="fl" style="width:22px;height:16px;background:none">${FL[s.f]}</span>${name(s)}`
      : state === 'connecting' ? T.connecting
      : state === 'err' ? `<span style="color:var(--err)">${name(s)}: ${T.noReply}</span>` : T.tap;
    $('#okline').textContent = state === 'on' ? T.ok : '';
    $('#pw').setAttribute('aria-label', state === 'off' || state === 'err' ? T.connect : T.disconnect);
  }
  const f2 = n => String(n).padStart(2, '0');
  function tick() {
    const d = Math.floor((Date.now() - t0) / 1000);
    $('#tm').textContent = `${f2(Math.floor(d / 3600))}:${f2(Math.floor(d / 60) % 60)}:${f2(d % 60)}`;
    $('#up').textContent = Math.round(20 + Math.random() * 40); $('#dn').textContent = Math.round(300 + Math.random() * 900);
  }
  function connect() {
    clearInterval(tmr); state = 'connecting'; render();
    setTimeout(() => {
      if (state !== 'connecting') return;
      if (S[sel].ping == null) { state = 'err'; render(); return; }
      state = 'on'; t0 = Date.now(); render(); tick(); tmr = setInterval(tick, 1000);
    }, reduce ? 40 : 1500);
  }
  function off() { clearInterval(tmr); state = 'off'; $('#tm').textContent = '00:00:00'; $('#up').textContent = '0'; $('#dn').textContent = '0'; render(); }

  document.addEventListener('click', e => {
    if (e.target.closest('#pw')) { (state === 'on' || state === 'connecting') ? off() : connect(); return; }
    const r = e.target.closest('.srv'); if (r) { sel = +r.dataset.i; render(); if (state !== 'off') connect(); return; }
    const f = e.target.closest('#flt span'); if (f) { flt = f.dataset.f; $$('#flt span').forEach(x => x.classList.toggle('on', x === f)); render(); return; }
    const t = e.target.closest('.tg'); if (t) {
      const on = t.classList.toggle('on'); t.setAttribute('aria-checked', on);
      if (t.id === 'hwTg') $('#hwId').classList.toggle('off', !on);
      return;
    }
    if (e.target.closest('#hwReset')) {
      if ($('#hwId').classList.contains('off')) return;
      const h = () => Math.floor(Math.random() * 16).toString(16), g = n => Array.from({ length: n }, h).join('');
      $('#hwId code').textContent = `${g(8)}-${g(4)}-4${g(3)}-${g(4)}-…`; return;
    }
    const rt = e.target.closest('.rt'); if (rt) { $$('.rt').forEach(x => { x.classList.toggle('on', x === rt); x.setAttribute('aria-checked', x === rt); }); return; }
    if (e.target.closest('.burger')) { setMenu(!document.body.classList.contains('menu-open')); return; }
    if (e.target.closest('.links a') || !e.target.closest('.nav')) setMenu(false);
  });

  // Мобильное меню: кнопка, Escape, клик вне меню
  const burger = $('.burger');
  function setMenu(open) { document.body.classList.toggle('menu-open', open); if (burger) burger.setAttribute('aria-expanded', open); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Клавиатура для элементов макета: Enter и пробел работают как клик, фокус остаётся на месте
  $$('#flt span').forEach(el => { el.setAttribute('role', 'button'); el.tabIndex = 0; });
  $$('.tg').forEach(el => { el.setAttribute('role', 'switch'); el.tabIndex = 0; el.setAttribute('aria-checked', el.classList.contains('on')); });
  $$('.rt').forEach(el => { el.setAttribute('role', 'radio'); el.tabIndex = 0; el.setAttribute('aria-checked', el.classList.contains('on')); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('.srv, #flt span, .tg, .rt'); if (!el) return;
    e.preventDefault();
    const list = el.closest('#srvList, #srvList2'), idx = el.dataset.i;
    el.click();
    if (list) { const again = list.querySelector(`.srv[data-i="${idx}"]`); if (again) again.focus(); }
  });
  const pw = $('#pw');
  if (pw) {
    pw.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pw.click(); } });
    render();
    setTimeout(() => { if (state === 'off') connect(); }, reduce ? 0 : 1100);
  }

  // Подсветка плитки системы посетителя
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : /Mac OS X/.test(ua) ? 'mac' : /Windows/.test(ua) ? 'windows' : /Linux/.test(ua) ? 'linux' : null;
  if (os) { const el = $(`.pl[data-os="${os}"]`); if (el) { el.classList.add('me'); el.dataset.me = T.yourOs; } }

  // «Фонарик»: созвездия ярче вокруг курсора
  const lit = $('#constB'), base = $('#constA');
  if (lit && base) {
    lit.innerHTML = base.innerHTML;
    if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
      const svg = $('#sky'); let raf = 0, mx = 0, my = 0;
      addEventListener('pointermove', e => {
        mx = e.clientX; my = e.clientY; if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, s = Math.max(r.width / vb.width, r.height / vb.height);
          const ox = (r.width - vb.width * s) / 2, oy = (r.height - vb.height * s) / 2;
          lit.style.setProperty('--mx', ((mx - ox) / s) + 'px'); lit.style.setProperty('--my', ((my - oy) / s) + 'px');
        });
      }, { passive: true });
    }
  }
  // Смена статусов в карточке «Честный статус»
  const st = $$('#states span'); let si = 0;
  if (st.length && !reduce) setInterval(() => { si = (si + 1) % st.length; st.forEach((x, i) => x.style.opacity = i === si ? 1 : .35); }, 1400);
  // Появление блоков при прокрутке (?shot — сразу всё, для скриншотов)
  if (/[?&]shot/.test(location.search) || !('IntersectionObserver' in window)) $$('.reveal').forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15 });
    $$('.reveal').forEach(el => io.observe(el));
  }
})();
