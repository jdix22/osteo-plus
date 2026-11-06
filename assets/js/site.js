/* OSTEO+ page behaviour. Loaded after shared.js (window.OP). */
(() => {
  'use strict';

  // Optional: a form service URL (Formspree, Basin, etc.). Empty = the form opens the visitor's email app.
  const FORM_ENDPOINT = '';

  const OP = window.OP;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ROOT = (document.currentScript?.src || '').replace(/assets\/js\/site\.js.*$/, '');
  document.documentElement.classList.add('js');

  /* ---------- header, menu ---------- */
  const head = $('[data-head]');
  const mBook = $('.m-book');
  const hero = $('.hero, .page-hero, .bio, .post-hero');
  const onScroll = () => {
    const y = scrollY;
    head?.classList.toggle('is-scrolled', y > 10);
    if (mBook) mBook.classList.toggle('is-on', y > (hero ? hero.offsetHeight * .7 : 400));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('[data-menu]'), drawer = $('#drawer');
  if (menuBtn && drawer) {
    const set = open => {
      drawer.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open);
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      menuBtn.innerHTML = OP.icon(open ? 'close' : 'menu') + `<span class="sr">${open ? 'Close menu' : 'Menu'}</span>`;
    };
    menuBtn.addEventListener('click', () => set(drawer.hidden));
    drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) { set(false); menuBtn.focus(); } });
  }

  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- open now (Toronto time) ---------- */
  (function openNow() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t)?.value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const mins = +get('hour') * 60 + +get('minute');
    const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const fmt = s => { let [h, m] = s.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ap; };
    const today = OP.SITE.hours.find(h => h.days.includes(day));
    let msg, open = false;
    if (today?.open && mins >= toMin(today.open) && mins < toMin(today.close)) { open = true; msg = `Open now · until ${fmt(today.close)}`; }
    else if (today?.open && mins < toMin(today.open)) msg = `Closed now · opens ${fmt(today.open)} today`;
    else {
      for (let i = 1; i <= 7; i++) {
        const d = (day + i) % 7, h = OP.SITE.hours.find(x => x.days.includes(d));
        if (h?.open) { msg = `Closed now · opens ${i === 1 ? 'tomorrow' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]} ${fmt(h.open)}`; break; }
      }
    }
    $$('[data-open-now], [data-open-pill]').forEach(el => { const s = el.querySelector('span'); if (s) s.textContent = msg; el.classList.toggle('is-open', open); });
    $$('[data-open-status]').forEach(el => { el.innerHTML = OP.icon('clock') + msg; el.classList.toggle('is-open', open); });
    $$('.hours [data-days]').forEach(el => el.classList.toggle('is-today', el.dataset.days.split(',').map(Number).includes(day)));
  })();

  /* ---------- tabs (concern matcher) ---------- */
  $$('[data-tabs]').forEach(list => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------- team rail arrows ---------- */
  $$('[data-rail-nav]').forEach(nav => {
    const rail = nav.closest('.wrap')?.querySelector('[data-rail]');
    if (!rail) return;
    $$('button', nav).forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * .8, behavior: 'smooth' })));
  });

  /* ---------- hero range-of-motion dial + reveal ---------- */
  const rom = $('[data-rom]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target === rom ? 'is-on' : 'is-in');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    if (rom) io.observe(rom);
    $$('.svc-card, .team-grid .team-card, .post-card, .steps li, .price-card, .values li, .note-card').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('reveal'); io.observe(el); }
    });
  } else rom?.classList.add('is-on');

  /* ---------- blog filter ---------- */
  // Free consult picker. Without <dialog> support the button just opens the booking page.
  const consultDlg = $('[data-consult-dlg]');
  if (consultDlg && consultDlg.showModal) {
    $$('[data-consult]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); consultDlg.showModal(); }));
    consultDlg.addEventListener('click', e => {
      if (e.target === consultDlg || e.target.closest('[data-close], .consult-list a')) consultDlg.close();
    });
  }

  const filter = $('[data-post-filter]');
  if (filter) filter.addEventListener('click', e => {
    const b = e.target.closest('[data-tag]'); if (!b) return;
    $$('.chip', filter).forEach(c => c.classList.toggle('is-on', c === b));
    $$('.post-card').forEach(c => (c.hidden = !!b.dataset.tag && c.dataset.service !== b.dataset.tag));
  });

  /* ---------- home: newest posts straight from the blog data, so new posts show without a rebuild ---------- */
  const latest = $('[data-latest-posts]');
  if (latest) fetch(ROOT + 'data/posts.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(d => {
    if (!d) return;
    const list = OP.published(d.posts).slice(0, 3);
    if (list.length) latest.innerHTML = list.map(p => OP.postCard(p, '')).join('');
  }).catch(() => {});

  /* ---------- social feeds ---------- */
  const feedTabs = $$('[data-feed-tab]');
  feedTabs.forEach((t, i) => {
    const pick = (tab, focus) => {
      feedTabs.forEach(x => {
        const on = x === tab;
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); pick(feedTabs[(i + k + feedTabs.length) % feedTabs.length], true); }
    });
  });
  $$('[data-feed-hide]').forEach(p => (p.hidden = true));

  const feeds = $('.feeds');
  if (feeds) fetch(ROOT + 'data/social.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(cfg => {
    if (!cfg) return;
    let live = 0;
    const tasks = ['instagram', 'tiktok', 'facebook'].map(net => {
      const id = (cfg[net]?.behold || '').trim().replace(/^https?:\/\/feeds\.behold\.so\//, '');
      if (!id) return null;
      return fetch('https://feeds.behold.so/' + encodeURIComponent(id)).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(data => {
        const posts = (Array.isArray(data) ? data : data.posts || []).filter(p => p.permalink && p.visibility !== 'hidden').slice(0, cfg[net].count || 8);
        if (!posts.length) return;
        renderFeed(net, posts);
        live++;
      }).catch(() => {});
    });
    Promise.all(tasks).then(() => { if (live) $('[data-feed-note]')?.remove(); });
  }).catch(() => {});

  const caption = p => (p.prunedCaption || p.caption || '').replace(/\s+/g, ' ').trim();
  const imgOf = p => (p.sizes?.medium?.mediaUrl) || p.thumbnailUrl || p.mediaUrl || '';
  function renderFeed(net, posts) {
    const list = $(`[data-feed="${net}"] [data-feed-list]`);
    const S = OP.SITE.social[net];
    const e = OP.esc;
    if (net === 'instagram') list.innerHTML = posts.map(p => {
      const cap = caption(p);
      const vid = /video|reel/i.test(p.mediaType || '');
      return `<li><a class="ig-tile" href="${e(p.permalink)}" target="_blank" rel="noopener"><img src="${e(imgOf(p))}" alt="${e(cap ? cap.slice(0, 110) : 'Instagram post by ' + S.handle)}" loading="lazy">${vid ? `<svg class="ig-video" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>` : ''}<span class="ig-cap">${e(cap.slice(0, 140))}</span></a></li>`;
    }).join('');
    else if (net === 'tiktok') list.innerHTML = posts.map(p => {
      const cap = caption(p);
      return `<li><a class="tt-tile" href="${e(p.permalink)}" target="_blank" rel="noopener"><img src="${e(imgOf(p))}" alt="" loading="lazy"><span class="tt-play">${OP.icon('play')}</span><span class="tt-cap">${e(cap.slice(0, 90))}</span></a></li>`;
    }).join('');
    else list.innerHTML = posts.map(p => {
      const cap = caption(p);
      return `<li><article class="fb-post"><header><img src="${ROOT}assets/img/brand/osteo-plus-avatar.png" alt="" width="80" height="80"><span><b>${OP.SITE.name}</b><small>${p.timestamp ? new Date(p.timestamp).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' }) : 'Facebook'}</small></span></header><p>${e(cap.slice(0, 260))}</p>${imgOf(p) ? `<a class="fb-img" href="${e(p.permalink)}" target="_blank" rel="noopener"><img src="${e(imgOf(p))}" alt="" loading="lazy"></a>` : ''}</article></li>`;
    }).join('');
  }

  /* ---------- contact form ---------- */
  const form = $('[data-contact-form]');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const st = $('[data-form-status]', form);
    const f = form.elements;
    const say = (msg, cls) => { st.textContent = msg; st.className = 'form-status ' + (cls || ''); };
    if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value) || !f.message.value.trim()) return say('Please add your name, a valid email and a message.', 'bad');
    const data = { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), service: f.service.value, message: f.message.value.trim() };
    if (FORM_ENDPOINT) {
      say('Sending…');
      try {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw 0;
        form.reset(); return say('Thanks! Your message was sent. We’ll be in touch soon.', 'ok');
      } catch (_) { say('Sending failed. Please email ' + OP.SITE.email + ' or call ' + OP.SITE.phone + '.', 'bad'); return; }
    }
    const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || '-'}\nInterested in: ${data.service || 'Not sure yet'}\n\n${data.message}`;
    location.href = `mailto:${OP.SITE.email}?subject=${encodeURIComponent('Website enquiry from ' + data.name)}&body=${encodeURIComponent(body)}`;
    say('Your email app should open with your message ready to send.', 'ok');
  });
})();
