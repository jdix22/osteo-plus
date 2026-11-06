/* OSTEO+ shared site pieces.
   One file used in two places so every page matches:
   - _src/build.js (Node) builds the whole site from it;
   - admin/ (browser) rebuilds blog pages, the blog index and the sitemap when a post is published.
   The business facts below are the single source for every page, the footer and the structured data. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OP = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SITE = {
    name: 'OSTEO+',
    tagline: 'Unlock your body’s full potential',
    // Prototype address. At launch: 'https://www.osteo-plus.ca' and NOINDEX false.
    url: 'https://jdix22.github.io/osteo-plus',
    noindex: true,
    phone: '(289) 588-3124',
    tel: '+12895883124',
    email: 'info@osteo-plus.ca',
    street: '10 Disera Dr, Unit 200',
    city: 'Thornhill',
    region: 'ON',
    postal: 'L4J 0A7',
    country: 'CA',
    mapQuery: 'OSTEO+ 10 Disera Dr Unit 200 Thornhill ON L4J 0A7',
    hours: [
      { label: 'Monday – Thursday', days: [1, 2, 3, 4], open: '10:00', close: '20:00', text: '10 am – 8 pm' },
      { label: 'Friday', days: [5], open: '10:00', close: '14:00', text: '10 am – 2 pm' },
      { label: 'Saturday', days: [6], open: '09:00', close: '14:00', text: '9 am – 2 pm' },
      { label: 'Sunday', days: [0], text: 'Closed' }
    ],
    booking: 'https://osteo-plus.janeapp.com/',
    social: {
      instagram: { label: 'Instagram', handle: '@osteoplus_', url: 'https://www.instagram.com/osteoplus_/' },
      tiktok: { label: 'TikTok', handle: '@osteoplus_', url: 'https://www.tiktok.com/@osteoplus_' },
      facebook: { label: 'Facebook', handle: 'OSTEO+', url: 'https://www.facebook.com/profile.php?id=61550116336816' }
    },
    credit: { label: 'Website designed by jdix.ca', url: 'https://jdix.ca' }
  };

  const JANE = id => (id ? `${SITE.booking}#/staff_member/${id}` : SITE.booking);
  const JANE_DISC = id => (id ? `${SITE.booking}#/discipline/${id}` : SITE.booking);

  // Practitioners. `jane` is their id on the Jane booking page (null = not bookable online yet).
  const TEAM = [
    { slug: 'justin-marco', name: 'Justin Marco', first: 'Justin', role: 'Osteopath (DOMP) · CEO & Clinic Director', jane: 1, services: ['osteopathy', 'cupping-therapy'] },
    { slug: 'anna-guimadeev', name: 'Anna Guimadeev', first: 'Anna', role: 'Osteopath (DOMP) & Registered Massage Therapist · Co-founder', jane: 2, services: ['osteopathy', 'massage-therapy', 'cupping-therapy'] },
    { slug: 'fanda-wong', name: 'Fanda Wong', first: 'Fanda', role: 'Registered Acupuncturist & TCM Practitioner', jane: null, services: ['acupuncture', 'cupping-therapy'] },
    { slug: 'erik-pasquino', name: 'Erik Pasquino', first: 'Erik', role: 'Traditional Chinese Medicine Practitioner & Acupuncturist', jane: 4, services: ['acupuncture', 'cupping-therapy', 'tmj'] },
    { slug: 'dr-angelica-dimita', name: 'Dr. Angelica Dimita, ND', first: 'Dr. Angelica', role: 'Naturopathic Doctor', jane: 9, services: ['naturopathy'] },
    { slug: 'dr-flora', name: 'Dr. Flora, ND', first: 'Dr. Flora', role: 'Naturopathic Doctor', jane: null, services: ['naturopathy'] },
    { slug: 'andrea-pellegrino', name: 'Andrea Pellegrino, RMT', first: 'Andrea', role: 'Registered Massage Therapist · Lymphatic Drainage', jane: 14, services: ['lymphatic-drainage-massage', 'massage-therapy'] },
    { slug: 'thalia', name: 'Thalia, RMT', first: 'Thalia', role: 'Registered Massage Therapist', jane: null, services: ['massage-therapy', 'lymphatic-drainage-massage', 'cupping-therapy'] },
    { slug: 'sammy', name: 'Sammy', first: 'Sammy', role: 'Massage Therapist · Fascial Stretch Therapist', jane: 12, services: ['fascial-stretch-therapy', 'therapeutic-sports-massage', 'tmj', 'massage-therapy'] },
    { slug: 'steve-shelmov', name: 'Steve Shelmov', first: 'Steve', role: 'Physiotherapist', jane: 15, services: ['physiotherapy'] },
    { slug: 'shirel-bronizer', name: 'Shirel Bronizer', first: 'Shirel', role: 'Certified Athletic Therapist', jane: 3, services: ['athletic-therapy', 'fascial-stretch-therapy', 'kinesiology-taping'] }
  ].map(p => ({ ...p, photo: `assets/img/team/${p.slug}.webp`, book: JANE(p.jane), path: `team/${p.slug}/` }));

  // Services, in menu order. `disc` is the Jane discipline id for "book this service".
  const SERVICES = [
    { slug: 'osteopathy', name: 'Osteopathy', group: 'manual', disc: 1, img: 'services/osteopathy-back-treatment', blurb: 'Hands-on treatment of muscles, joints and connective tissue to ease pain and restore movement.' },
    { slug: 'physiotherapy', name: 'Physiotherapy', group: 'manual', disc: 13, img: 'services/physiotherapy-knee', blurb: 'Evidence-based rehab for injuries, post-surgical recovery, chronic pain and movement problems.' },
    { slug: 'athletic-therapy', name: 'Athletic Therapy', group: 'manual', disc: 3, img: 'services/athletic-therapy-session', blurb: 'Assessment, treatment and rehab for sport, activity and posture-related injuries.' },
    { slug: 'massage-therapy', name: 'Registered Massage Therapy', short: 'Massage Therapy', group: 'manual', disc: 4, img: 'services/massage-therapy', blurb: 'Manual techniques by Registered Massage Therapists to relieve pain, relax muscles and improve function.' },
    { slug: 'therapeutic-sports-massage', name: 'Therapeutic Sports Massage', group: 'manual', disc: 6, img: 'services/therapeutic-sports-massage', blurb: 'Deep, focused work on tense or painful muscle groups, for athletes and desk workers alike.' },
    { slug: 'fascial-stretch-therapy', name: 'Fascial Stretch Therapy', short: 'Fascial Stretch (FST)', group: 'manual', disc: 9, img: 'services/fascial-stretch-therapy', blurb: 'Gentle assisted stretching that targets the fascia to improve range of motion and ease pain.' },
    { slug: 'tmj', name: 'TMJ Treatment', group: 'manual', disc: 7, img: 'services/tmj-jaw-pain', blurb: 'Massage and acupuncture approaches for jaw pain, clicking, locking and tension headaches.' },
    { slug: 'acupuncture', name: 'Acupuncture', group: 'natural', disc: 2, img: 'services/acupuncture-needles', blurb: 'Very thin needles at strategic points to ease pain, stress, migraines and more.' },
    { slug: 'cupping-therapy', name: 'Cupping Therapy', group: 'natural', disc: null, img: 'services/cupping-on-back', blurb: 'Suction cups on the skin to increase circulation and relieve muscle tension.' },
    { slug: 'naturopathy', name: 'Naturopathy', group: 'natural', disc: 8, img: 'services/naturopathy-tincture', blurb: 'Naturopathic Doctors blending evidence-based medicine with natural therapies to treat root causes.' },
    { slug: 'lymphatic-drainage-massage', name: 'Brazilian Lymphatic Drainage', short: 'Lymphatic Drainage', group: 'specialty', disc: 5, img: 'services/lymphatic-drainage-massage', blurb: 'Gentle, rhythmic massage that reduces fluid retention and supports digestion and detox.' },
    { slug: 'kinesiology-taping', name: 'Kinesiology Taping', group: 'specialty', disc: null, img: 'services/kinesiology-taping-knee', blurb: 'Strips of special tape that support joints, muscles and tendons and help correct posture.' }
  ].map(s => ({ ...s, short: s.short || s.name, path: `${s.slug}/`, book: JANE_DISC(s.disc) }));

  const GROUPS = { manual: 'Manual & movement therapy', natural: 'Traditional & natural medicine', specialty: 'Specialty treatments' };

  /* ---------- helpers ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const abs = path => SITE.url + '/' + String(path || '').replace(/^\/+/, '');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = iso => { const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
  const plain = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z#0-9]+;/gi, c => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[c] || ' ').replace(/\s+/g, ' ').trim();
  const readMins = html => Math.max(1, Math.ceil(plain(html).split(" ").length / 220));
  const person = slug => TEAM.find(t => t.slug === slug);
  const service = slug => SERVICES.find(s => s.slug === slug);
  const img = (p, ext = 'webp') => `assets/img/${p}.${ext}`;

  const ICON = {
    phone: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/>',
    mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.2V17h16V7.2l-8 5.3zM5.4 7l6.6 4.4L18.6 7z"/>',
    pin: '<path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>',
    clock: '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 3v4.6l3.2 1.9-1 1.7L11 12.7V7z"/>',
    arrow: '<path d="M13.2 5.3 20 12l-6.8 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3z"/>',
    instagram: '<path d="M12 7.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 1.9a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM17.3 5.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM7.7 2h8.6A5.7 5.7 0 0 1 22 7.7v8.6a5.7 5.7 0 0 1-5.7 5.7H7.7A5.7 5.7 0 0 1 2 16.3V7.7A5.7 5.7 0 0 1 7.7 2zm0 1.9a3.8 3.8 0 0 0-3.8 3.8v8.6a3.8 3.8 0 0 0 3.8 3.8h8.6a3.8 3.8 0 0 0 3.8-3.8V7.7a3.8 3.8 0 0 0-3.8-3.8z"/>',
    tiktok: '<path d="M16.6 2c.3 2.4 1.7 3.9 4 4.1v3a7.3 7.3 0 0 1-4-1.3v6.4c0 4-3 6.8-6.6 6.8a6.4 6.4 0 0 1-6.4-6.6c0-3.9 3.3-6.8 7.4-6.3v3.2a3.2 3.2 0 0 0-4.1 3.1 3.2 3.2 0 0 0 3.3 3.3c1.9 0 3.2-1.3 3.2-3.6V2z"/>',
    facebook: '<path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22z"/>',
    menu: '<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>',
    close: '<path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    check: '<path d="m9.5 16.2-4.2-4.2-1.4 1.4 5.6 5.6 11-11-1.4-1.4z"/>',
    calendar: '<path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm12 8H5v9h14zM5 8h14V6H5z"/>',
    chevron: '<path d="m7.4 8.6 4.6 4.6 4.6-4.6L18 10l-6 6-6-6z"/>'
  };
  const icon = (name, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[name]}</svg>`;

  // Version stamp for CSS/JS links so browsers pick up changes (bump on every deploy).
  const BUILD = '20261105c';

  /* ---------- <head> ---------- */
  function head({ title, desc, path = '', root = '', image = 'assets/img/brand/og-osteo-plus.png', imageAlt, type = 'website', jsonld = [], noindex = SITE.noindex, extraHead = '' }) {
    const url = abs(path);
    const robots = noindex ? '<meta name="robots" content="noindex">\n' : '';
    const ld = jsonld.length ? `<script type="application/ld+json">${JSON.stringify(jsonld.length === 1 ? jsonld[0] : { '@context': 'https://schema.org', '@graph': jsonld.map(j => { const { '@context': _c, ...rest } = j; return rest; }) }).replace(/</g, '\\u003c')}</script>\n` : '';
    return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${robots}<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="en_CA">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs(image)}">
<meta property="og:image:alt" content="${esc(imageAlt || title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${abs(image)}">
<meta name="theme-color" content="#15120e">
<link rel="icon" href="${root}assets/img/brand/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="${root}assets/img/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Urbanist:ital,wght@0,300..800;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/css/site.css?v=${BUILD}">
${extraHead}${ld}</head>`;
  }

  /* ---------- header + footer ---------- */
  function brand(root) {
    return `<a class="brand" href="${root || './'}" aria-label="${SITE.name} home">
      <img src="${root}assets/img/brand/mark-88.png" alt="" width="44" height="44">
      <span class="brand-word">OSTEO<b>+</b></span>
    </a>`;
  }

  function header(root, current = '') {
    const on = key => (current === key ? ' aria-current="page"' : '');
    const groups = Object.entries(GROUPS).map(([g, label]) => `
          <div class="mega-col">
            <p class="mega-h">${label}</p>
            <ul>${SERVICES.filter(s => s.group === g).map(s => `<li><a href="${root}${s.path}"${on(s.slug)}>${s.name}</a></li>`).join('')}</ul>
          </div>`).join('');
    return `<a class="skip" href="#main">Skip to content</a>
<div class="topbar">
  <div class="wrap topbar-in">
    <a href="tel:${SITE.tel}">${icon('phone')}${SITE.phone}</a>
    <a href="mailto:${SITE.email}">${icon('mail')}${SITE.email}</a>
    <span class="topbar-addr">${icon('pin')}${SITE.street}, ${SITE.city}</span>
    <span class="topbar-hours" data-open-status>${icon('clock')}Mon–Thu 10–8 · Fri 10–2 · Sat 9–2</span>
  </div>
</div>
<header class="site-head" data-head>
  <div class="wrap head-in">
    ${brand(root)}
    <nav class="nav" aria-label="Main">
      <ul class="nav-list">
        <li class="has-mega">
          <a href="${root}services/"${on('services')} class="nav-services">Services ${icon('chevron', 'i chev')}</a>
          <div class="mega">
            <div class="mega-in">${groups}
              <a class="mega-cta" href="${root}services/">
                <span>See every service, side by side</span>${icon('arrow')}
              </a>
            </div>
          </div>
        </li>
        <li><a href="${root}about-us/"${on('about')}>Our Team</a></li>
        <li><a href="${root}pricing/"${on('pricing')}>Pricing</a></li>
        <li><a href="${root}blog/"${on('blog')}>Blog</a></li>
        <li><a href="${root}faqs/"${on('faqs')}>FAQs</a></li>
        <li><a href="${root}contact-us/"${on('contact')}>Contact</a></li>
      </ul>
    </nav>
    <a class="btn btn-gold head-book" href="${SITE.booking}" target="_blank" rel="noopener">Book appointment</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" data-menu>${icon('menu')}<span class="sr">Menu</span></button>
  </div>
</header>
<div class="drawer" id="drawer" hidden>
  <div class="drawer-in">
    <p class="drawer-h">Services</p>
    <ul class="drawer-svc">${SERVICES.map(s => `<li><a href="${root}${s.path}">${s.short}</a></li>`).join('')}</ul>
    <ul class="drawer-main">
      <li><a href="${root || './'}">Home</a></li>
      <li><a href="${root}about-us/">Our Team</a></li>
      <li><a href="${root}pricing/">Pricing</a></li>
      <li><a href="${root}blog/">Blog</a></li>
      <li><a href="${root}faqs/">FAQs</a></li>
      <li><a href="${root}contact-us/">Contact</a></li>
    </ul>
    <a class="btn btn-gold btn-wide" href="${SITE.booking}" target="_blank" rel="noopener">Book appointment</a>
    <a class="btn btn-line btn-wide" href="tel:${SITE.tel}">${icon('phone')}Call ${SITE.phone}</a>
  </div>
</div>`;
  }

  function socialLinks(cls = 'social') {
    return `<ul class="${cls}">${Object.entries(SITE.social).map(([k, s]) => `<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${SITE.name} on ${s.label}">${icon(k)}</a></li>`).join('')}</ul>`;
  }

  function hoursList() {
    return `<dl class="hours">${SITE.hours.map(h => `<div data-days="${h.days.join(',')}"><dt>${h.label}</dt><dd>${h.text}</dd></div>`).join('')}</dl>`;
  }

  function footer(root) {
    return `<section class="pre-foot">
  <div class="wrap pre-foot-in">
    <div>
      <p class="eyebrow">Ready when you are</p>
      <h2 class="pre-foot-h">Book online in a few taps, or call the front desk.</h2>
    </div>
    <div class="pre-foot-cta">
      <a class="btn btn-gold" href="${SITE.booking}" target="_blank" rel="noopener">${icon('calendar')}Book appointment</a>
      <a class="btn btn-line-light" href="tel:${SITE.tel}">${icon('phone')}${SITE.phone}</a>
    </div>
  </div>
</section>
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      ${brand(root)}
      <p>${SITE.name} is an osteopathy, chronic pain and wellness clinic in ${SITE.city}, Ontario. ${SITE.tagline}.</p>
      ${socialLinks()}
    </div>
    <div>
      <h2 class="foot-h">Visit</h2>
      <address>
        <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(SITE.mapQuery)}" target="_blank" rel="noopener">${SITE.street}<br>${SITE.city}, ${SITE.region} ${SITE.postal}</a><br>
        <a href="tel:${SITE.tel}">${SITE.phone}</a><br>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
      </address>
      ${hoursList()}
    </div>
    <div>
      <h2 class="foot-h">Services</h2>
      <ul class="foot-links">${SERVICES.map(s => `<li><a href="${root}${s.path}">${s.short}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="foot-h">Clinic</h2>
      <ul class="foot-links">
        <li><a href="${root || './'}">Home</a></li>
        <li><a href="${root}about-us/">About &amp; team</a></li>
        <li><a href="${root}services/">All services</a></li>
        <li><a href="${root}pricing/">Pricing</a></li>
        <li><a href="${root}blog/">Blog</a></li>
        <li><a href="${root}faqs/">FAQs</a></li>
        <li><a href="${root}contact-us/">Contact us</a></li>
        <li><a href="${root}shop/">Shop</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap foot-base">
    <p>© <span data-year>2026</span> ${SITE.name} · ${SITE.tagline}. All rights reserved.</p>
    <p><a href="${SITE.credit.url}" target="_blank" rel="noopener">${SITE.credit.label}</a></p>
  </div>
</footer>
<a class="m-book" href="${SITE.booking}" target="_blank" rel="noopener">${icon('calendar')}Book appointment</a>`;
  }

  function scripts(root, extra = '') {
    return `<script src="${root}assets/js/shared.js?v=${BUILD}"></script>
<script src="${root}assets/js/site.js?v=${BUILD}" defer></script>${extra}`;
  }

  function page({ meta, root, current, main }) {
    return `${head({ ...meta, root })}
<body>
${header(root, current)}
<main id="main">
${main}
</main>
${footer(root)}
${scripts(root, meta.scripts || '')}
</body>
</html>
`;
  }

  /* ---------- structured data ---------- */
  function businessLd() {
    const days = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
    return {
      '@context': 'https://schema.org',
      '@type': ['MedicalClinic', 'LocalBusiness'],
      '@id': SITE.url + '/#clinic',
      name: SITE.name,
      alternateName: 'Osteo Plus',
      slogan: SITE.tagline,
      description: `${SITE.name} is an osteopathy clinic in ${SITE.city}, Ontario specializing in chronic pain management and wellness, offering osteopathy, physiotherapy, athletic therapy, registered massage therapy, acupuncture, naturopathy and more.`,
      url: SITE.url + '/',
      logo: abs('assets/img/brand/osteo-plus-logo-square.png'),
      image: abs('assets/img/clinic/osteo-plus-team-thornhill.webp'),
      telephone: SITE.tel,
      email: SITE.email,
      address: { '@type': 'PostalAddress', streetAddress: SITE.street, addressLocality: SITE.city, addressRegion: SITE.region, postalCode: SITE.postal, addressCountry: SITE.country },
      openingHoursSpecification: SITE.hours.filter(h => h.open).map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map(d => days[d]), opens: h.open, closes: h.close })),
      medicalSpecialty: ['Musculoskeletal', 'PhysicalTherapy'],
      availableService: SERVICES.map(s => ({ '@type': 'MedicalTherapy', name: s.name, url: abs(s.path) })),
      sameAs: Object.values(SITE.social).map(s => s.url),
      potentialAction: { '@type': 'ReserveAction', target: SITE.booking, name: 'Book an appointment' }
    };
  }

  function crumbsLd(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) }))
    };
  }

  function crumbs(root, items) {
    return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([name, path], i) => i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${root}${path}">${esc(name)}</a></li>`).join('')}</ol></nav>`;
  }

  /* ---------- blog ---------- */
  const published = posts => posts.filter(p => p.status !== 'draft').sort((a, b) => (a.date < b.date ? 1 : -1));

  function postCard(p, root, headingTag = 'h3') {
    const s = service(p.service);
    return `<article class="post-card"${s ? ` data-service="${s.slug}"` : ''}>
      <a class="post-card-img" href="${root}post/${p.slug}/" tabindex="-1" aria-hidden="true">${p.cover ? `<img src="${root}${p.cover}" alt="" loading="lazy" width="800" height="530">` : '<span class="post-card-ph"></span>'}</a>
      <div class="post-card-body">
        <p class="post-card-meta">${s ? `<span class="tag">${esc(s.short)}</span>` : ''}<time datetime="${p.date}">${fmtDate(p.date)}</time></p>
        <${headingTag} class="post-card-h"><a href="${root}post/${p.slug}/">${esc(p.title)}</a></${headingTag}>
        <p class="post-card-ex">${esc(p.description)}</p>
      </div>
    </article>`;
  }

  function postPage(p, posts) {
    const root = '../../';
    const path = `post/${p.slug}/`;
    const expert = person(p.expert);
    const s = service(p.service);
    const others = published(posts).filter(x => x.slug !== p.slug).slice(0, 3);
    const mins = readMins(p.body);
    const ld = [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        dateModified: p.updated || p.date,
        author: { '@type': 'Person', name: p.author || 'OSTEO+' },
        ...(expert ? { reviewedBy: { '@type': 'Person', name: expert.name, jobTitle: expert.role.split(' · ')[0], url: abs(expert.path) } } : {}),
        publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: abs('assets/img/brand/osteo-plus-logo-square.png') } },
        mainEntityOfPage: abs(path),
        ...(p.cover ? { image: abs(p.cover) } : {})
      },
      crumbsLd([['Home', ''], ['Blog', 'blog/'], [p.title, path]])
    ];
    const bookUrl = expert ? expert.book : s ? s.book : SITE.booking;
    const main = `
<article class="post">
  <header class="post-hero">
    <div class="wrap-narrow">
      ${crumbs(root, [['Home', ''], ['Blog', 'blog/'], [p.title, path]])}
      ${s ? `<a class="tag tag-link" href="${root}${s.path}">${esc(s.name)}</a>` : ''}
      <h1 class="post-h1">${esc(p.title)}</h1>
      <p class="post-meta">
        <span>By ${esc(p.author || SITE.name)}</span>
        <span><time datetime="${p.date}">${fmtDate(p.date)}</time>${p.updated && p.updated !== p.date ? ` · updated <time datetime="${p.updated}">${fmtDate(p.updated)}</time>` : ''}</span>
        <span>${mins} min read</span>
      </p>
    </div>
  </header>
  ${p.cover ? `<figure class="post-cover wrap-mid"><img src="${root}${p.cover}" alt="${esc(p.coverAlt || '')}" width="1600" height="1000"></figure>` : ''}
  <div class="wrap-narrow post-layout">
    <div class="prose">${p.body}</div>
    ${expert ? `<aside class="expert-card">
      <img src="${root}${expert.photo}" alt="${esc(expert.name)}" width="720" height="900" loading="lazy">
      <div>
        <p class="eyebrow">Written with</p>
        <p class="expert-name"><a href="${root}${expert.path}">${esc(expert.name)}</a></p>
        <p class="expert-role">${esc(expert.role)}</p>
        <a class="btn btn-gold" href="${bookUrl}" target="_blank" rel="noopener">${icon('calendar')}Book with ${esc(expert.first)}</a>
      </div>
    </aside>` : `<aside class="expert-card expert-card-plain"><div><p class="expert-name">Questions about your own situation?</p><p class="expert-role">Our practitioners can assess you in person.</p><a class="btn btn-gold" href="${bookUrl}" target="_blank" rel="noopener">${icon('calendar')}Book an appointment</a></div></aside>`}
    <p class="post-disclaimer">This article is general information, not medical advice. Our practitioners do not diagnose or practise medicine. If you are concerned about a medical condition, please speak with your physician.</p>
  </div>
</article>
${others.length ? `<section class="section section-paper">
  <div class="wrap">
    <div class="sec-head"><h2 class="h2">More from the blog</h2><a class="link-arrow" href="${root}blog/">All posts ${icon('arrow')}</a></div>
    <div class="post-grid">${others.map(o => postCard(o, root)).join('')}</div>
  </div>
</section>` : ''}`;
    return page({
      root, current: 'blog', main,
      meta: { title: p.metaTitle || `${p.title} | ${SITE.name} ${SITE.city}`, desc: p.description, path, image: p.cover || undefined, imageAlt: p.coverAlt, type: 'article', jsonld: ld }
    });
  }

  function blogIndex(posts) {
    const root = '../';
    const list = published(posts);
    const tags = [...new Set(list.map(p => p.service).filter(Boolean))].map(service).filter(Boolean);
    const main = `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Blog', 'blog/']])}
    <p class="eyebrow">The OSTEO+ blog</p>
    <h1 class="h1">Notes from our practitioners</h1>
    <p class="lede">Plain-language articles from the ${SITE.name} team in ${SITE.city} on pain, recovery, pregnancy, mental health and the treatments we offer.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${tags.length > 1 ? `<div class="chips" role="group" aria-label="Filter posts by treatment" data-post-filter>
      <button type="button" class="chip is-on" data-tag="">All posts</button>
      ${tags.map(t => `<button type="button" class="chip" data-tag="${t.slug}">${esc(t.short)}</button>`).join('')}
    </div>` : ''}
    <div class="post-grid">${list.map(p => postCard(p, root, 'h2')).join('') || '<p>New articles are on the way.</p>'}</div>
  </div>
</section>`;
    const ld = [
      { '@context': 'https://schema.org', '@type': 'Blog', name: `${SITE.name} blog`, url: abs('blog/'), publisher: { '@type': 'Organization', name: SITE.name }, blogPost: list.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`post/${p.slug}/`), datePublished: p.date })) },
      crumbsLd([['Home', ''], ['Blog', 'blog/']])
    ];
    return page({
      root, current: 'blog', main,
      meta: { title: `Blog | ${SITE.name} Osteopathy Clinic, ${SITE.city}`, desc: `Articles from the ${SITE.name} practitioners in ${SITE.city} on osteopathy, acupuncture, massage, naturopathy, pregnancy care and recovery. Read, then book online.`, path: 'blog/', jsonld: ld }
    });
  }

  function sitemap(pages, posts) {
    const today = new Date().toISOString().slice(0, 10);
    const rows = [
      ...pages.map(p => ({ loc: abs(p.path), lastmod: p.lastmod || today })),
      ...published(posts).map(p => ({ loc: abs(`post/${p.slug}/`), lastmod: p.updated || p.date }))
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map(r => `  <url><loc>${r.loc}</loc><lastmod>${r.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
  }

  return { SITE, TEAM, SERVICES, GROUPS, BUILD, JANE, JANE_DISC, esc, abs, fmtDate, plain, readMins, person, service, img, icon, head, header, footer, page, brand, socialLinks, hoursList, businessLd, crumbsLd, crumbs, published, postCard, postPage, blogIndex, sitemap };
});
