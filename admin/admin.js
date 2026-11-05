/* OSTEO+ — private blog manager.
   How it is protected: the GitHub access token that can edit the site is stored only inside
   admin/vault.json, encrypted (AES-GCM, key from the password via PBKDF2). Without the password the
   vault is useless, and nothing on the public site links here.
   Publishing rebuilds every blog page, the blog index and the sitemap with assets/js/shared.js (the same
   templates the site build uses) and saves them to GitHub in a single commit. */
(() => {
  'use strict';

  const OP = window.OP;
  const PBKDF2_ITER = 600000;
  const POSTS_PATH = 'data/posts.json', PAGES_PATH = 'data/site-pages.json', SOCIAL_PATH = 'data/social.json';
  const IMG_DIR = 'assets/img/blog/';
  const SESSION_KEY = 'op-admin';
  const enc = new TextEncoder(), dec = new TextDecoder();
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = OP.esc;

  let vault = null, token = null, repo = null, branch = 'main';
  let posts = [], sitePages = [], social = {};
  let socialChanged = false;
  const staged = new Map();     // repo path -> base64 content waiting to publish
  const previews = new Map();   // image path -> data URL, for photos not yet on the live site
  const deletions = new Set();  // repo paths to remove on publish
  const changedSlugs = new Set();
  const log = [];               // human-readable list of edits, used as the commit message

  /* ---------- small helpers ---------- */
  const b64 = buf => { let s = ''; new Uint8Array(buf).forEach(b => (s += String.fromCharCode(b))); return btoa(s); };
  const unb64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
  const b64utf8 = str => b64(enc.encode(str));
  const show = id => $$('.screen').forEach(s => (s.hidden = s.id !== id));
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date());
  function setStatus(el, msg, kind) { el.textContent = msg; el.className = 'status' + (kind ? ' ' + kind : ''); }
  let toastT;
  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toastT); toastT = setTimeout(() => (t.className = 'toast'), bad ? 6000 : 3500);
  }
  function guessRepo() {
    // On GitHub Pages the address tells us owner/repo; on a custom domain the vault says.
    if (location.hostname.endsWith('.github.io')) {
      const owner = location.hostname.split('.')[0];
      const name = location.pathname.split('/').filter(Boolean)[0];
      if (name && name !== 'admin') return owner + '/' + name;
    }
    return 'jdix22/osteo-plus';
  }
  const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '') || 'post';
  const isBlogImage = p => typeof p === 'string' && p.startsWith(IMG_DIR);

  /* ---------- crypto ---------- */
  async function keyFrom(pw, salt, iter) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function seal(pw, secret) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await keyFrom(pw, salt, PBKDF2_ITER);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(secret)));
    return { v: 1, repo, branch, iter: PBKDF2_ITER, salt: b64(salt), iv: b64(iv), data: b64(ct) };
  }
  async function unseal(pw, v) {
    const key = await keyFrom(pw, unb64(v.salt), v.iter);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(v.iv) }, key, unb64(v.data));
    return JSON.parse(dec.decode(pt));
  }

  /* ---------- GitHub ---------- */
  async function gh(path, opts = {}) {
    const res = await fetch('https://api.github.com' + path, {
      ...opts,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.headers || {})
      }
    });
    if (!res.ok) {
      let detail = ''; try { detail = (await res.json()).message; } catch (_) {}
      const err = new Error(`GitHub said ${res.status}${detail ? ': ' + detail : ''}`); err.status = res.status; throw err;
    }
    if (res.status === 204) return null;
    return opts.raw ? res.text() : res.json();
  }
  const readFile = path => gh(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`, { raw: true, headers: { Accept: 'application/vnd.github.raw+json' } });

  // One commit containing every staged file and deletion.
  async function commit(files, removals, message) {
    const R = `/repos/${repo}`;
    const ref = await gh(`${R}/git/ref/heads/${branch}`);
    const head = await gh(`${R}/git/commits/${ref.object.sha}`);
    const tree = [];
    for (const [path, content] of files) {
      const blob = await gh(`${R}/git/blobs`, { method: 'POST', body: JSON.stringify({ content, encoding: 'base64' }) });
      tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    if (removals.size) {
      const existing = await gh(`${R}/git/trees/${head.tree.sha}?recursive=1`);
      const have = new Set(existing.tree.map(t => t.path));
      removals.forEach(p => { if (have.has(p) && !files.has(p)) tree.push({ path: p, mode: '100644', type: 'blob', sha: null }); });
    }
    const newTree = await gh(`${R}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
    const c = await gh(`${R}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }) });
    await gh(`${R}/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
  }

  async function loadData() {
    const [p, pg, so] = await Promise.all([readFile(POSTS_PATH), readFile(PAGES_PATH), readFile(SOCIAL_PATH).catch(() => '{}')]);
    posts = JSON.parse(p).posts || [];
    sitePages = JSON.parse(pg).pages || [];
    social = JSON.parse(so) || {};
  }

  /* ---------- boot ---------- */
  async function fetchVault() {
    const tries = ['vault.json?t=' + Date.now(), `https://raw.githubusercontent.com/${guessRepo()}/main/admin/vault.json?t=${Date.now()}`];
    for (const url of tries) {
      try { const r = await fetch(url, { cache: 'no-store' }); if (r.ok) return await r.json(); } catch (_) {}
    }
    return null;
  }

  async function boot() {
    if (!window.crypto?.subtle) { show('screen-loading'); $('#screen-loading p').textContent = 'This page must be opened over https.'; return; }
    vault = await fetchVault();
    if (!vault) {
      show('screen-setup');
      $('#setup-form').repo.value = guessRepo();
      return;
    }
    repo = vault.repo; branch = vault.branch || 'main';
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) { token = saved; return enterApp(); }
    show('screen-login');
    $('#login-form').pw.focus();
  }

  /* ---------- setup ---------- */
  $('#setup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = $('.status', f), btn = $('button', f);
    if (f.pw.value.length < 10) return setStatus(st, 'Password needs at least 10 characters.', 'bad');
    if (f.pw.value !== f.pw2.value) return setStatus(st, 'The two passwords don’t match.', 'bad');
    repo = f.repo.value.trim(); branch = f.branch.value.trim() || 'main'; token = f.token.value.trim();
    btn.disabled = true; setStatus(st, 'Checking the token…');
    try {
      await loadData();
      setStatus(st, 'Encrypting and saving…');
      vault = await seal(f.pw.value, { token });
      await commit(new Map([['admin/vault.json', b64utf8(JSON.stringify(vault, null, 2) + '\n')]]), new Set(), 'Blog manager: set up admin password');
      sessionStorage.setItem(SESSION_KEY, token);
      f.reset();
      toast('Blog manager is ready. Use the password you just chose to sign in from now on.');
      enterApp();
    } catch (err) {
      token = null;
      setStatus(st, err.status === 401 ? 'That token was not accepted.' : err.status === 403 || err.status === 404 ? 'The token can’t write to that repository. It needs Contents: Read and write.' : err.message, 'bad');
    } finally { btn.disabled = false; }
  });

  /* ---------- login ---------- */
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = $('.status', f), btn = $('button', f);
    btn.disabled = true; setStatus(st, 'Unlocking…');
    try {
      const secret = await unseal(f.pw.value, vault);
      token = secret.token;
      sessionStorage.setItem(SESSION_KEY, token);
      f.reset();
      enterApp();
    } catch (_) {
      await new Promise(r => setTimeout(r, 900));
      setStatus(st, 'That password isn’t right.', 'bad');
      f.pw.select();
    } finally { btn.disabled = false; }
  });

  $('#logout').addEventListener('click', () => {
    if (log.length && !confirm('You have unpublished changes. Sign out and lose them?')) return;
    log.length = 0;
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  async function enterApp() {
    show('screen-loading');
    $('#screen-loading p').textContent = 'Loading your posts…';
    try { await loadData(); }
    catch (err) {
      sessionStorage.removeItem(SESSION_KEY);
      show('screen-login');
      setStatus($('#login-form .status'), err.status === 401 ? 'The site’s GitHub token has expired or was revoked. Ask your website manager to renew it.' : 'Could not load the posts: ' + err.message, 'bad');
      return;
    }
    show('screen-app');
    fillSocial();
    renderAll();
  }

  /* ---------- tabs ---------- */
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.classList.toggle('is-on', x === b));
    $$('.tab-panel').forEach(p => (p.hidden = p.id !== 'tab-' + b.dataset.tab));
  }));

  /* ---------- post list ---------- */
  const sorted = () => [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const coverSrc = p => previews.get(p.cover) || (p.cover ? '../' + p.cover : '');

  function renderAll() { renderList(); renderBar(); }

  function renderList() {
    const live = posts.filter(p => p.status !== 'draft').length;
    $('#count-line').textContent = `${live} published${posts.length - live ? `, ${posts.length - live} draft` : ''}`;
    $('#post-list').innerHTML = posts.length ? sorted().map(p => {
      const s = OP.service(p.service), who = OP.person(p.expert);
      const draft = p.status === 'draft';
      return `<li class="row${draft ? ' is-draft' : ''}${changedSlugs.has(p.slug) ? ' is-changed' : ''}" data-slug="${esc(p.slug)}">
        ${p.cover ? `<img class="thumb" src="${esc(coverSrc(p))}" alt="" loading="lazy">` : '<span class="thumb-ph"></span>'}
        <div class="info">
          <b>${esc(p.title)}</b>
          <small>${OP.fmtDate(p.date)} · by ${esc(p.author || 'OSTEO+')}${who ? ` · book with ${esc(who.first)}` : ''}</small>
          <div class="badges">
            ${draft ? '<span class="badge draft">Draft, not on the site</span>' : ''}
            ${s ? `<span class="badge svc">${esc(s.short)}</span>` : ''}
            ${changedSlugs.has(p.slug) ? '<span class="badge">Unpublished edits</span>' : ''}
          </div>
        </div>
        <div class="actions">
          <button data-act="edit">Edit</button>
          ${!draft && !changedSlugs.has(p.slug) ? `<a href="../post/${esc(p.slug)}/" target="_blank" rel="noopener">View</a>` : ''}
          <button data-act="toggle">${draft ? 'Publish' : 'Hide'}</button>
          <button data-act="del" class="del">Delete</button>
        </div>
      </li>`;
    }).join('') : '<li class="empty-row">No posts yet. Press “Write a new post” to start.</li>';
  }

  function renderBar() {
    $('#publish-bar').hidden = !log.length;
    $('#pending-count').textContent = log.length;
  }

  function changed(what, slug) { log.push(what); if (slug) changedSlugs.add(slug); renderAll(); }

  // Images that belong only to the blog are cleaned up when nothing uses them any more.
  const imagesIn = html => [...String(html || '').matchAll(/src="(?:\.\.\/)*(assets\/img\/blog\/[^"]+)"/g)].map(m => m[1]);
  const imageInUse = (path, except) => posts.some(p => p !== except && (p.cover === path || imagesIn(p.body).includes(path)));
  function dropImage(path, except) {
    if (!isBlogImage(path) || imageInUse(path, except)) return;
    staged.delete(path); previews.delete(path); deletions.add(path);
  }

  $('#post-list').addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]'); if (!btn) return;
    const p = posts.find(x => x.slug === btn.closest('.row').dataset.slug);
    switch (btn.dataset.act) {
      case 'edit': openEditor(p); break;
      case 'toggle':
        p.status = p.status === 'draft' ? 'published' : 'draft';
        changed(`${p.status === 'draft' ? 'Hide' : 'Publish'}: ${p.title}`, p.slug); break;
      case 'del':
        if (!confirm(`Delete “${p.title}” from the website? This removes its page. To keep it but hide it, use Hide instead.`)) return;
        posts.splice(posts.indexOf(p), 1);
        deletions.add(`post/${p.slug}/index.html`);
        dropImage(p.cover, p); imagesIn(p.body).forEach(i => dropImage(i, p));
        changedSlugs.delete(p.slug);
        changed(`Delete ${p.title}`); break;
    }
  });

  /* ---------- photos: resize and save as webp ---------- */
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('That file could not be read as a picture. Try a JPG, PNG or WebP.'));
      im.src = url;
    });
  }
  function prepare(im, maxW) {
    const s = Math.min(1, maxW / im.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height);
    let url = c.toDataURL('image/webp', 0.8), ext = 'webp';
    if (!url.startsWith('data:image/webp')) { url = c.toDataURL('image/jpeg', 0.84); ext = 'jpg'; } // older Safari can't write webp
    return { url, ext, b64: url.split(',')[1] };
  }

  /* ---------- rich text editor ---------- */
  const rte = $('#rte');
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (_) {}
  let savedRange = null;
  const saveSel = () => { const s = getSelection(); if (s.rangeCount && rte.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); };
  const restoreSel = () => { rte.focus(); if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); } };
  rte.addEventListener('keyup', saveSel); rte.addEventListener('mouseup', saveSel); rte.addEventListener('input', saveSel);

  const ALLOWED = new Set(['P', 'H2', 'H3', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'A', 'BLOCKQUOTE', 'IMG', 'BR']);
  const RENAME = { B: 'STRONG', I: 'EM', DIV: 'P', H1: 'H2', H4: 'H3', H5: 'H3', H6: 'H3' };
  const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'META', 'LINK', 'SVG', 'VIDEO', 'AUDIO', 'NOSCRIPT']);
  const safeHref = h => /^(https?:|mailto:|tel:|#|\.{0,2}\/)/i.test(h || '') ? h : '';

  // Keep only simple, safe formatting so every post matches the site's design.
  function clean(root) {
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 8) return ch.remove();
        if (ch.nodeType !== 1) return;
        let el = ch;
        if (DROP.has(el.tagName)) return el.remove();
        if (RENAME[el.tagName]) {
          const n = document.createElement(RENAME[el.tagName]);
          while (el.firstChild) n.appendChild(el.firstChild);
          [...el.attributes].forEach(a => n.setAttribute(a.name, a.value));
          el.replaceWith(n); el = n;
        }
        walk(el);
        if (!ALLOWED.has(el.tagName)) { el.replaceWith(...el.childNodes); return; }
        const keep = { A: ['href'], IMG: ['src', 'alt', 'data-path'], P: ['class'] }[el.tagName] || [];
        [...el.attributes].forEach(a => { if (!keep.includes(a.name)) el.removeAttribute(a.name); });
        if (el.tagName === 'P' && el.className && el.className !== 'lead') el.removeAttribute('class');
        if (el.tagName === 'A') { const h = safeHref(el.getAttribute('href')); if (!h) el.replaceWith(...el.childNodes); else el.setAttribute('href', h); }
        if (el.tagName === 'IMG' && !el.getAttribute('src')) el.remove();
      });
    };
    walk(root);
    // Browsers sometimes put lists or headings inside a paragraph; lift them out.
    let nested;
    while ((nested = $$('p, h2, h3', root).find(p => p.querySelector('p, ul, ol, h2, h3, blockquote')))) nested.replaceWith(...nested.childNodes);
    $$('li', root).forEach(li => $$('p', li).forEach(p => p.replaceWith(...p.childNodes)));
    // Loose text at the top level becomes a paragraph.
    let para = null;
    [...root.childNodes].forEach(ch => {
      const inline = ch.nodeType === 3 || ['STRONG', 'EM', 'A', 'BR'].includes(ch.nodeName);
      if (inline) {
        if (ch.nodeType === 3 && !ch.textContent.trim() && !para) return ch.remove();
        if (!para) { para = document.createElement('p'); ch.before(para); }
        para.appendChild(ch);
      } else para = null;
    });
    $$('p, h2, h3, li, blockquote', root).forEach(el => { if (!el.textContent.trim() && !el.querySelector('img')) el.remove(); });
    return root;
  }

  rte.addEventListener('paste', e => {
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    e.preventDefault();
    const box = document.createElement('div');
    if (html) box.innerHTML = html;
    else box.innerHTML = text.split(/\n{2,}/).map(t => `<p>${esc(t).replace(/\n/g, '<br>')}</p>`).join('');
    $$('img', box).forEach(i => i.remove()); // pasted pictures would point at other websites; use the Photo button
    document.execCommand('insertHTML', false, clean(box).innerHTML);
  });

  function toEditor(body) {
    const box = document.createElement('div');
    box.innerHTML = body || '';
    $$('img', box).forEach(img => {
      const src = img.getAttribute('src') || '';
      if (/^(https?:|data:)/.test(src)) return;
      const path = src.replace(/^(\.\.\/)+/, '');
      img.setAttribute('data-path', path);
      img.setAttribute('src', previews.get(path) || '../' + path);
    });
    return box.innerHTML;
  }
  function fromEditor() {
    const box = clean(rte.cloneNode(true));
    $$('img', box).forEach(img => {
      const path = img.getAttribute('data-path');
      if (path) img.setAttribute('src', '../../' + path);
      img.removeAttribute('data-path');
      img.setAttribute('loading', 'lazy');
    });
    return box.innerHTML.trim();
  }

  $('.rte-bar').addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
  $('.rte-bar').addEventListener('click', e => {
    const b = e.target.closest('button[data-cmd]'); if (!b) return;
    restoreSel();
    const cmd = b.dataset.cmd;
    const block = { h2: 'H2', h3: 'H3', p: 'P', quote: 'BLOCKQUOTE' }[cmd];
    if (block) document.execCommand('formatBlock', false, '<' + block + '>');
    else if (cmd === 'bold' || cmd === 'italic' || cmd === 'undo' || cmd === 'redo' || cmd === 'unlink') document.execCommand(cmd);
    else if (cmd === 'ul') document.execCommand('insertUnorderedList');
    else if (cmd === 'ol') document.execCommand('insertOrderedList');
    else if (cmd === 'link') {
      const sel = getSelection();
      if (!sel || sel.isCollapsed) return toast('Select the words you want to link first.', true);
      let url = prompt('Paste the web address for this link (for example a page on this site or https://…):', 'https://');
      if (!url || url === 'https://') return;
      url = url.trim();
      if (!/^(https?:|mailto:|tel:|\/|#)/i.test(url)) url = 'https://' + url;
      restoreSel(); document.execCommand('createLink', false, url);
    } else if (cmd === 'image') { saveSel(); $('#inline-file').click(); }
    saveSel();
  });

  $('#inline-file').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    try {
      const pic = prepare(await loadImage(file), 1400);
      const alt = (prompt('Briefly describe the photo (helps people using screen readers, and Google):', '') || '').trim();
      const path = `${IMG_DIR}${slugify(form.title.value || 'post').slice(0, 40)}-${Date.now().toString(36)}.${pic.ext}`;
      staged.set(path, pic.b64); previews.set(path, pic.url);
      restoreSel();
      document.execCommand('insertHTML', false, `<img src="${pic.url}" data-path="${path}" alt="${esc(alt)}"><p><br></p>`);
    } catch (err) { setStatus($('#editor-status'), err.message, 'bad'); }
  });

  /* ---------- post editor ---------- */
  const dlg = $('#editor'), form = $('#post-form');
  let editing = null, pendingCover = null, removeCover = false;
  form.expert.innerHTML = '<option value="">Nobody in particular</option>' + OP.TEAM.map(t => `<option value="${t.slug}">${esc(t.name)}</option>`).join('');
  form.service.innerHTML = '<option value="">None</option>' + OP.SERVICES.map(s => `<option value="${s.slug}">${esc(s.name)}</option>`).join('');
  $('#team-names').innerHTML = OP.TEAM.map(t => `<option value="${esc(t.name)}">`).join('');

  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) takeCover(e.dataTransfer.files[0]); });
  $('#cover-file').addEventListener('change', e => { if (e.target.files[0]) takeCover(e.target.files[0]); });
  async function takeCover(file) {
    const st = $('#editor-status');
    setStatus(st, 'Preparing photo…');
    try {
      pendingCover = prepare(await loadImage(file), 1600); removeCover = false;
      showCover(pendingCover.url);
      setStatus(st, '');
    } catch (err) { setStatus(st, err.message, 'bad'); }
  }
  function showCover(src) {
    const pv = $('#cover-preview');
    if (src) { pv.src = src; pv.hidden = false; $('#drop-msg').innerHTML = '<b>Change photo</b>'; $('#cover-remove').hidden = false; }
    else { pv.hidden = true; pv.removeAttribute('src'); $('#drop-msg').innerHTML = '<b>Add a cover photo</b> or drag it here<br><small>Resized automatically. Landscape works best.</small>'; $('#cover-remove').hidden = true; }
  }
  $('#cover-remove').addEventListener('click', () => { pendingCover = null; removeCover = true; showCover(''); $('#cover-file').value = ''; });

  const descCount = () => { const n = form.description.value.length; $('#desc-count').textContent = `${n}/160${n > 160 ? ' (a little long for Google)' : ''}`; };
  form.description.addEventListener('input', descCount);
  const slugLine = () => {
    const slug = editing ? editing.slug : uniqueSlug(slugify(form.title.value));
    $('#slug-line').textContent = form.title.value || editing ? `Page address: …/post/${slug}/` : '';
  };
  form.title.addEventListener('input', slugLine);
  function uniqueSlug(base) {
    const taken = new Set(posts.map(p => p.slug));
    let s = base, n = 2;
    while (taken.has(s)) s = `${base}-${n++}`;
    return s;
  }

  function openEditor(p) {
    editing = p || null; pendingCover = null; removeCover = false;
    form.reset(); $('#cover-file').value = '';
    $('#editor-title').textContent = p ? 'Edit post' : 'New post';
    setStatus($('#editor-status'), '');
    if (p) {
      form.title.value = p.title; form.description.value = p.description || ''; form.date.value = p.date;
      form.status.value = p.status || 'published'; form.author.value = p.author || '';
      form.expert.value = p.expert || ''; form.service.value = p.service || '';
      form.metaTitle.value = p.metaTitle || ''; form.coverAlt.value = p.coverAlt || '';
      showCover(p.cover ? coverSrc(p) : '');
      rte.innerHTML = toEditor(p.body);
    } else {
      form.date.value = today(); form.author.value = 'Justin Marco'; form.status.value = 'published';
      showCover('');
      rte.innerHTML = '';
    }
    savedRange = null;
    descCount(); slugLine();
    dlg.showModal();
    form.title.focus();
  }
  $('#add-post').addEventListener('click', () => openEditor(null));

  function collect() {
    const f = form;
    return {
      title: f.title.value.trim(),
      description: f.description.value.trim().replace(/\s+/g, ' '),
      date: f.date.value,
      status: f.status.value,
      author: f.author.value.trim(),
      expert: f.expert.value,
      service: f.service.value,
      metaTitle: f.metaTitle.value.trim(),
      coverAlt: f.coverAlt.value.trim(),
      body: fromEditor()
    };
  }

  form.addEventListener('submit', e => {
    if (e.submitter?.value !== 'save') return;
    const st = $('#editor-status');
    const v = collect();
    const fail = (msg, el) => { e.preventDefault(); setStatus(st, msg, 'bad'); el?.focus(); };
    if (!v.title) return fail('Please give the post a title.', form.title);
    if (OP.plain(v.body).split(' ').length < 40) return fail('The post is very short. Add at least a few paragraphs before saving.', rte);
    if (!v.description) return fail('Please add a one or two sentence summary.', form.description);
    if (!v.date) return fail('Please choose a date.', form.date);
    if (!v.author) return fail('Please say who wrote it.', form.author);
    const hasCover = pendingCover || (editing?.cover && !removeCover);
    if (hasCover && !v.coverAlt) return fail('Please describe the cover photo in a few words.', form.coverAlt);

    let p = editing;
    const oldBodyImages = p ? imagesIn(p.body) : [];
    if (!p) {
      p = { slug: uniqueSlug(slugify(v.title)) };
      posts.push(p);
    } else if (p.status !== 'draft' && p.date === v.date) {
      p.updated = today();
    }
    Object.assign(p, v);
    if (!p.metaTitle) delete p.metaTitle;
    if (pendingCover) {
      const old = p.cover;
      const path = `${IMG_DIR}${p.slug.slice(0, 50)}-${Date.now().toString(36)}.${pendingCover.ext}`;
      p.cover = path;
      staged.set(path, pendingCover.b64); previews.set(path, pendingCover.url);
      if (old && old !== path) dropImage(old, p);
    } else if (removeCover && p.cover) { const old = p.cover; p.cover = ''; dropImage(old, p); }
    if (!p.cover) p.coverAlt = '';
    // Photos taken out of the text are removed too (only ones uploaded for the blog).
    const nowImages = imagesIn(p.body);
    oldBodyImages.filter(i => !nowImages.includes(i)).forEach(i => dropImage(i, p));
    [...staged.keys()].filter(k => isBlogImage(k) && !imageInUse(k)).forEach(k => { staged.delete(k); previews.delete(k); });
    changed(`${editing ? 'Edit' : 'New post'}: ${p.title}`, p.slug);
  });

  $('#preview-btn').addEventListener('click', () => {
    const v = collect();
    const slug = editing ? editing.slug : uniqueSlug(slugify(v.title || 'preview'));
    const cover = pendingCover ? 'preview-cover' : removeCover ? '' : editing?.cover || '';
    const draft = { ...editing, ...v, slug, cover, status: 'published' };
    const others = posts.filter(p => p !== editing);
    let html = OP.postPage(draft, [...others, draft]);
    if (pendingCover) html = html.split('../../preview-cover').join(pendingCover.url);
    previews.forEach((url, path) => { html = html.split('../../' + path).join(url); });
    const base = new URL(`../post/${slug}/`, location.href).href;
    html = html.replace('<head>', `<head><base href="${base}">`).replace('<title>', '<title>Preview: ');
    const w = window.open('', '_blank');
    if (!w) return toast('Your browser blocked the preview window. Allow pop-ups for this page.', true);
    w.document.open(); w.document.write(html); w.document.close();
  });

  /* ---------- social feeds ---------- */
  const NETS = ['instagram', 'tiktok', 'facebook'];
  const DEFAULT_COUNT = { instagram: 8, tiktok: 4, facebook: 3 };
  function fillSocial() {
    const f = $('#social-form');
    NETS.forEach(n => { f[n].value = social[n]?.behold || ''; f[n + '_count'].value = social[n]?.count || DEFAULT_COUNT[n]; });
  }
  $('#social-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, st = $('.status', f);
    NETS.forEach(n => {
      const id = f[n].value.trim().replace(/^https?:\/\/feeds\.behold\.so\//i, '').replace(/[/?#].*$/, '');
      social[n] = { behold: id, count: Math.max(1, Math.min(12, +f[n + '_count'].value || DEFAULT_COUNT[n])) };
      f[n].value = id;
    });
    socialChanged = true;
    changed('Social feed settings');
    setStatus(st, 'Saved. Press Publish to update the website.', 'ok');
  });

  /* ---------- publish ---------- */
  async function publish(extra) {
    const btn = $('#publish');
    btn.disabled = true; btn.textContent = 'Publishing…';
    try {
      const files = new Map(staged);
      [...files.keys()].filter(k => isBlogImage(k) && !imageInUse(k)).forEach(k => files.delete(k)); // photos from an editor that was cancelled
      const removals = new Set(deletions);
      files.set(POSTS_PATH, b64utf8(JSON.stringify({ posts: sorted() }, null, 1) + '\n'));
      // Every published post page is rebuilt, so "More from the blog" stays current everywhere.
      posts.forEach(p => {
        const page = `post/${p.slug}/index.html`;
        if (p.status === 'draft') removals.add(page);
        else { files.set(page, b64utf8(OP.postPage(p, posts))); removals.delete(page); }
      });
      files.set('blog/index.html', b64utf8(OP.blogIndex(posts)));
      files.set('sitemap.xml', b64utf8(OP.sitemap(sitePages, posts)));
      if (socialChanged) files.set(SOCIAL_PATH, b64utf8(JSON.stringify(social, null, 1) + '\n'));
      if (extra) extra.forEach((v, k) => files.set(k, v));
      const summary = [...new Set(log)];
      const message = 'Blog manager: ' + (summary.slice(0, 3).join('; ') || 'update') + (summary.length > 3 ? ` (+${summary.length - 3} more)` : '');
      await commit(files, removals, message);
      staged.clear(); deletions.clear(); log.length = 0; changedSlugs.clear(); socialChanged = false;
      renderAll();
      toast('Published. The website shows your changes in a minute or two.');
      return true;
    } catch (err) {
      toast((err.status === 409 || err.status === 422 ? 'The site changed somewhere else. Reload this page and try again. ' : 'Publishing failed. ') + err.message, true);
      return false;
    } finally { btn.disabled = false; btn.textContent = 'Publish to website'; }
  }
  $('#publish').addEventListener('click', () => publish());

  $('#discard').addEventListener('click', async () => {
    if (!confirm('Throw away all unpublished changes?')) return;
    staged.clear(); deletions.clear(); log.length = 0; changedSlugs.clear(); previews.clear(); socialChanged = false;
    await loadData(); fillSocial(); renderAll();
    toast('Changes discarded.');
  });

  addEventListener('beforeunload', e => { if (log.length) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- settings ---------- */
  $('#pw-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = $('.status', f), btn = $('button', f);
    if (f.pw.value.length < 10) return setStatus(st, 'At least 10 characters, please.', 'bad');
    if (f.pw.value !== f.pw2.value) return setStatus(st, 'The two passwords don’t match.', 'bad');
    btn.disabled = true; setStatus(st, 'Saving…');
    try {
      const nv = await seal(f.pw.value, { token });
      log.push('Change password');
      const ok = await publish(new Map([['admin/vault.json', b64utf8(JSON.stringify(nv, null, 2) + '\n')]]));
      if (ok) { vault = nv; f.reset(); setStatus(st, 'Password changed. Use the new one next time you sign in.', 'ok'); }
      else setStatus(st, 'Could not save the new password.', 'bad');
    } finally { btn.disabled = false; }
  });

  boot();
})();
