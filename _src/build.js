/* Builds every page of the OSTEO+ site.  Run:  node _src/build.js
   Blog posts come from data/posts.json, which the /admin/ editor also updates (it rebuilds the
   blog pages itself with assets/js/shared.js, so posts look the same either way). */
'use strict';
const fs = require('fs');
const path = require('path');
const OP = require('../assets/js/shared.js');
const C = require('./content.js');

const OUT = path.join(__dirname, '..');
const { SITE, TEAM, SERVICES, GROUPS, esc, icon, page, crumbs, crumbsLd, businessLd, person, service, abs, postCard, published } = OP;
const posts = JSON.parse(fs.readFileSync(path.join(OUT, 'data/posts.json'), 'utf8')).posts;
const written = [];

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.push(rel);
}
const rootFor = p => '../'.repeat(p.split('/').filter(Boolean).length);

/* Intrinsic image sizes, read from the WebP/PNG headers so every <img> gets width/height. */
const dimCache = {};
function dims(rel) {
  if (dimCache[rel]) return dimCache[rel];
  const b = fs.readFileSync(path.join(OUT, rel));
  let w = 0, h = 0;
  if (b.toString('ascii', 0, 4) === 'RIFF') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; }
    else if (kind === 'VP8L') { const n = b.readUInt32LE(21); w = (n & 0x3fff) + 1; h = ((n >> 14) & 0x3fff) + 1; }
    else if (kind === 'VP8X') { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); }
  } else if (b.readUInt32BE(0) === 0x89504e47) { w = b.readUInt32BE(16); h = b.readUInt32BE(20); }
  return (dimCache[rel] = [w, h]);
}
function pic(root, file, alt, { cls = '', lazy = true, sizes = '' } = {}) {
  const rel = `assets/img/${file}.webp`;
  const [w, h] = dims(rel);
  return `<img${cls ? ` class="${cls}"` : ''} src="${root}${rel}" alt="${esc(alt)}" width="${w}" height="${h}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${sizes ? ` sizes="${sizes}"` : ''}>`;
}

const money = n => '$' + n;
const priceFor = slug => C.PRICING.find(p => p.service === slug || p.also === slug);
const fromPrice = slug => { const p = priceFor(slug); return p ? Math.min(...p.rows.map(r => r[1])) : null; };
// Free 15-minute consults on Jane (discipline id / treatment id from the Jane booking page).
const CONSULTS = [
  { slug: 'osteopathy', label: 'Osteopathy', how: 'In person', disc: 1, tx: 1, who: 'justin-marco' },
  { slug: 'acupuncture', label: 'Acupuncture', how: 'In person', disc: 2, tx: 6, who: 'erik-pasquino' },
  { slug: 'athletic-therapy', label: 'Athletic therapy', how: 'In person', disc: 3, tx: 16, who: 'shirel-bronizer' },
  { slug: 'naturopathy', label: 'Naturopathic medicine', how: 'By phone', disc: 8, tx: 28, who: 'dr-angelica-dimita' }
].map(c => ({ ...c, url: `${SITE.booking}#/discipline/${c.disc}/treatment/${c.tx}` }));
const FREE_CONSULT = CONSULTS.filter(c => c.how === 'In person').map(c => c.slug);
const consultFor = slug => CONSULTS.find(c => c.slug === slug);
const offering = slug => TEAM.filter(t => t.services.includes(slug));

const bookBtn = (url, label, cls = 'btn btn-gold') => `<a class="${cls}" href="${url}" target="_blank" rel="noopener">${icon('calendar')}${label}</a>`;
const callBtn = (cls = 'btn btn-line') => `<a class="${cls}" href="tel:${SITE.tel}">${icon('phone')}${SITE.phone}</a>`;

function teamMini(root, t) {
  return `<li class="mini">
    <a class="mini-link" href="${root}${t.path}">
      <img src="${root}${t.photo}" alt="${esc(t.name)}" width="720" height="900" loading="lazy" decoding="async">
      <span><b>${esc(t.name)}</b><small>${esc(t.role)}</small></span>
    </a>
    <a class="mini-book" href="${t.book}" target="_blank" rel="noopener" aria-label="Book with ${esc(t.first)}">Book</a>
  </li>`;
}

function teamCard(root, t, h = 'h3') {
  return `<li class="team-card">
    <a href="${root}${t.path}">
      <span class="team-photo"><img src="${root}${t.photo}" alt="${esc(t.name)}, ${esc(t.role.split(' · ')[0])}" width="720" height="900" loading="lazy" decoding="async"></span>
      <${h} class="team-name">${esc(t.name)}</${h}>
      <span class="team-role">${esc(t.role)}</span>
    </a>
  </li>`;
}

function serviceCard(root, s, h = 'h3') {
  const from = fromPrice(s.slug);
  return `<li class="svc-card">
    <a href="${root}${s.path}">
      <span class="svc-img">${pic(root, s.img, '')}</span>
      <span class="svc-body">
        <${h} class="svc-name">${esc(s.name)}</${h}>
        <span class="svc-blurb">${esc(s.blurb)}</span>
        <span class="svc-foot"><span>${from ? `From ${money(from)}` : 'Part of treatment'}</span>${icon('arrow')}</span>
      </span>
    </a>
  </li>`;
}

function faqList(items, open = -1) {
  return `<div class="faq">${items.map(([q, a], i) => `<details${i === open ? ' open' : ''}><summary><h3>${esc(q)}</h3><span class="faq-x" aria-hidden="true"></span></summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;
}

const faqLd = items => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

function priceCard(p, { book = true } = {}) {
  const s = service(p.service);
  return `<div class="price-card" id="price-${p.service}">
    <h3 class="price-h">${esc(p.name)}</h3>
    <table class="price-table"><caption class="sr">${esc(p.name)} prices</caption><tbody>
      ${p.rows.map(([len, amt]) => `<tr><th scope="row">${esc(len)}</th><td>${money(amt)}</td></tr>`).join('')}
    </tbody></table>
    <p class="price-tax">${esc(p.tax)}</p>
    ${book && s ? `<a class="link-arrow" href="${s.book}" target="_blank" rel="noopener">Book ${esc(s.short.toLowerCase())} ${icon('arrow')}</a>` : ''}
  </div>`;
}

/* Live "open now" line and the visit block are reused on home and contact. */
function visitBlock(root, { map = true, h = 'h2' } = {}) {
  return `<div class="visit">
    <div class="visit-info">
      <${h} class="h3">Visit the clinic</${h}>
      <p class="open-now" data-open-now>${icon('clock')}<span>Mon–Thu 10 am – 8 pm · Fri 10 am – 2 pm · Sat 9 am – 2 pm</span></p>
      <address class="visit-addr">
        <span>${icon('pin')}<span>${SITE.street}, ${SITE.city}, ${SITE.region} ${SITE.postal}<br><small>Second floor</small></span></span>
        <a href="tel:${SITE.tel}">${icon('phone')}<span>${SITE.phone}</span></a>
        <a href="mailto:${SITE.email}">${icon('mail')}<span>${SITE.email}</span></a>
      </address>
      ${OP.hoursList()}
      <div class="btn-row">
        ${bookBtn(SITE.booking, 'Book online')}
        <a class="btn btn-line" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(SITE.mapQuery)}" target="_blank" rel="noopener">${icon('pin')}Directions</a>
      </div>
    </div>
    ${map ? `<div class="visit-map"><iframe title="Map showing ${SITE.name} at ${SITE.street}, ${SITE.city}" src="https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&amp;z=15&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
  </div>`;
}

/* ---------- social feed (placeholders until Behold feed IDs are added in data/social.json) ---------- */
const PH = {
  instagram: [
    ['clinic/osteo-plus-team-thornhill', 'Meet the OSTEO+ team. Osteopathy, physio, athletic therapy, RMTs, acupuncture and naturopathy under one roof.'],
    ['services/cupping-on-back', 'Cupping marks usually fade in 5–10 days. Keep the area warm and covered afterwards.'],
    ['clinic/normatec-recovery-boots', 'Recovery day. Our NormaTec boots are ready for you.'],
    ['clinic/reception-logo-wall', 'Find us at 10 Disera Dr, Unit 200, on the second floor. See you soon!'],
    ['services/osteopathy-back-treatment', 'Osteopathy looks at the whole body to find the root cause of your pain.'],
    ['services/athletic-therapy-session', 'Athletic therapy: assessment, rehab and taping to get you back to 100%.'],
    ['clinic/osteopath-definition-wall', 'Os·te·o·path: someone who treats the whole you.'],
    ['clinic/waiting-area', 'A calm space to land before your treatment.']
  ],
  tiktok: [
    ['services/cupping-cups', 'Cupping, explained in 30 seconds'],
    ['services/lymphatic-drainage-massage', 'What buccal facial massage actually does'],
    ['services/fascial-stretch-therapy', 'Assisted stretching for tight hips'],
    ['services/acupuncture-needles', 'Does acupuncture hurt? Watch this.']
  ],
  facebook: [
    ['clinic/treatment-room', 'We’re on the second floor at 10 Disera Dr in Thornhill. Book online any time, or call (289) 588-3124.'],
    ['services/lymphatic-drainage-massage', 'New on the blog: the natural Botox alternative. Lymphatic drainage and buccal facial massage with Andrea Pellegrino, RMT.'],
    ['services/consultation', 'Free 15-minute consultations are available for osteopathy, acupuncture and athletic therapy. Choose “Initial Consultation” when you book.']
  ]
};

function socialSection(root) {
  const s = SITE.social;
  const ig = PH.instagram.map(([im, cap]) => `<li><a class="ig-tile" href="${s.instagram.url}" target="_blank" rel="noopener">${pic(root, im, cap)}<span class="ig-cap">${esc(cap)}</span></a></li>`).join('');
  const tt = PH.tiktok.map(([im, cap]) => `<li><a class="tt-tile" href="${s.tiktok.url}" target="_blank" rel="noopener">${pic(root, im, '')}<span class="tt-play">${icon('play')}</span><span class="tt-cap">${esc(cap)}</span></a></li>`).join('');
  const fb = PH.facebook.map(([im, cap]) => `<li><article class="fb-post">
      <header><img src="${root}assets/img/brand/osteo-plus-avatar.png" alt="" width="80" height="80"><span><b>${SITE.name}</b><small>Facebook</small></span></header>
      <p>${esc(cap)}</p>
      <a href="${s.facebook.url}" target="_blank" rel="noopener" class="fb-img">${pic(root, im, '')}</a>
    </article></li>`).join('');
  return `<section class="section social-sec" id="social" aria-labelledby="social-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">Follow along</p>
        <h2 class="h2" id="social-h">OSTEO+ on social</h2>
        <p class="sec-sub">Tips, team news and behind-the-scenes from the clinic. <span class="feed-note" data-feed-note>Live posts appear here once the feeds are connected.</span></p>
      </div>
      ${OP.socialLinks('social social-big')}
    </div>
    <div class="feed-tabs" role="tablist" aria-label="Social networks">
      <button role="tab" id="tab-ig" aria-controls="feed-instagram" aria-selected="true" data-feed-tab="instagram">${icon('instagram')}Instagram</button>
      <button role="tab" id="tab-tt" aria-controls="feed-tiktok" aria-selected="false" tabindex="-1" data-feed-tab="tiktok">${icon('tiktok')}TikTok</button>
      <button role="tab" id="tab-fb" aria-controls="feed-facebook" aria-selected="false" tabindex="-1" data-feed-tab="facebook">${icon('facebook')}Facebook</button>
    </div>
    <div class="feeds" data-root="${root}">
      <div class="feed" id="feed-instagram" role="tabpanel" aria-labelledby="tab-ig" data-feed="instagram">
        <ul class="ig-grid" data-feed-list>${ig}</ul>
        <a class="btn btn-line" href="${s.instagram.url}" target="_blank" rel="noopener">${icon('instagram')}Follow ${s.instagram.handle}</a>
      </div>
      <div class="feed" id="feed-tiktok" role="tabpanel" aria-labelledby="tab-tt" data-feed="tiktok" data-feed-hide>
        <ul class="tt-grid" data-feed-list>${tt}</ul>
        <a class="btn btn-line" href="${s.tiktok.url}" target="_blank" rel="noopener">${icon('tiktok')}Follow ${s.tiktok.handle} on TikTok</a>
      </div>
      <div class="feed" id="feed-facebook" role="tabpanel" aria-labelledby="tab-fb" data-feed="facebook" data-feed-hide>
        <ul class="fb-grid" data-feed-list>${fb}</ul>
        <a class="btn btn-line" href="${s.facebook.url}" target="_blank" rel="noopener">${icon('facebook')}Follow ${SITE.name} on Facebook</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ================= HOME ================= */
function buildHome() {
  const root = '';
  const latest = published(posts).slice(0, 3);
  const matcher = C.CONCERNS.map((c, i) => `
      <div class="match-panel" id="need-${c.id}" role="tabpanel" aria-labelledby="chip-${c.id}"${i ? ' hidden' : ''}>
        <p class="match-why">${esc(c.why)}</p>
        <div class="match-cols">
          <div>
            <h3 class="match-h">Treatments that help</h3>
            <ul class="match-svc">${c.services.map(service).map(s => `<li><a href="${s.path}"><span>${esc(s.name)}</span><small>${fromPrice(s.slug) ? 'From ' + money(fromPrice(s.slug)) : 'Part of treatment'}</small>${icon('arrow')}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h3 class="match-h">Who you’d see</h3>
            <ul class="minis">${c.team.map(person).map(t => teamMini(root, t)).join('')}</ul>
          </div>
        </div>
      </div>`).join('');

  const main = `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="eyebrow eyebrow-light">${SITE.name} · ${SITE.city}, Ontario</p>
      <h1 class="hero-h1">An osteopathy clinic in Thornhill for chronic pain and <em>whole-body wellness.</em></h1>
      <p class="hero-lede">Osteopaths, a physiotherapist, an athletic therapist, RMTs, acupuncturists and naturopathic doctors on one team, working together to help you unlock your body’s full potential.</p>
      <div class="btn-row">
        ${bookBtn(SITE.booking, 'Book appointment')}
        <a class="btn btn-line-light" href="#find">Find the right treatment ${icon('arrow')}</a>
      </div>
      <ul class="hero-facts">
        <li class="hf-stats"><p><b>${TEAM.length}</b><span>practitioners</span></p><p><b>${SERVICES.length}</b><span>treatments</span></p></li>
        <li class="hf-consult">
          <a class="consult-cta" href="${SITE.booking}" target="_blank" rel="noopener" data-consult aria-haspopup="dialog">
            <span class="cc-dial" aria-hidden="true"><b>15</b><small>min</small></span>
            <span class="cc-text"><small>Not sure where to start?</small><strong>Book a free <span class="nw">15-minute consult</span></strong></span>
            <span class="cc-go" aria-hidden="true">${icon('arrow')}</span>
          </a>
        </li>
      </ul>
      <dialog class="consult-dlg" data-consult-dlg aria-labelledby="consult-h">
        <button class="dlg-x" type="button" data-close aria-label="Close">${icon('close')}</button>
        <p class="eyebrow">Free · 15 minutes · No obligation</p>
        <h2 id="consult-h">Book your free consult</h2>
        <p class="dlg-lede">Choose what you’d like to ask about. You’ll pick a time and fill in your details on our secure booking page.</p>
        <ul class="consult-list">${CONSULTS.map(c => { const t = person(c.who); return `
          <li><a href="${c.url}" target="_blank" rel="noopener">
            <img src="${root}${t.photo}" alt="" width="720" height="900" loading="lazy" decoding="async">
            <span><b>${c.label}</b><small>${c.how} with ${esc(t.name)}</small></span>
            ${icon('arrow')}
          </a></li>`; }).join('')}
        </ul>
        <p class="dlg-foot">Still not sure? Call <a href="tel:${SITE.tel}">${SITE.phone}</a> and we’ll point you to the right practitioner.</p>
      </dialog>
    </div>
    <div class="hero-art" aria-hidden="false">
      <svg class="rom" viewBox="0 0 400 400" aria-hidden="true" data-rom>
        <path class="rom-track" d="M 40 200 A 160 160 0 0 1 360 200"/>
        <path class="rom-fill" d="M 40 200 A 160 160 0 0 1 360 200" pathLength="100"/>
        <g class="rom-ticks">${Array.from({ length: 19 }, (_, i) => { const a = Math.PI - (i * Math.PI) / 18; const r1 = i % 3 ? 172 : 168, r2 = 182; return `<line x1="${(200 + r1 * Math.cos(a)).toFixed(1)}" y1="${(200 - r1 * Math.sin(a)).toFixed(1)}" x2="${(200 + r2 * Math.cos(a)).toFixed(1)}" y2="${(200 - r2 * Math.sin(a)).toFixed(1)}"/>`; }).join('')}</g>
        <g class="rom-needle"><line x1="200" y1="200" x2="56" y2="200"/><circle cx="56" cy="200" r="6"/></g>
      </svg>
      <figure class="hero-arch">${pic(root, 'clinic/treatment-room', 'A bright treatment room at OSTEO+ with a treatment table and plant', { lazy: false })}</figure>
      <figure class="hero-card">
        ${pic(root, 'clinic/osteo-plus-team-thornhill', 'The OSTEO+ team seated in front of the clinic’s logo wall', { lazy: false })}
        <figcaption>The OSTEO+ team, Disera Drive</figcaption>
      </figure>
      <p class="open-pill" data-open-pill>${icon('clock')}<span>Mon–Thu 10–8 · Fri 10–2 · Sat 9–2</span></p>
    </div>
  </div>
</section>

<section class="strip" aria-label="Treatments offered">
  <div class="strip-track">${[...SERVICES, ...SERVICES].map((s, i) => `<a href="${s.path}"${i >= SERVICES.length ? ' aria-hidden="true" tabindex="-1"' : ''}>${esc(s.short)}</a>`).join('<span aria-hidden="true">+</span>')}</div>
</section>

<section class="section match" id="find" aria-labelledby="find-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">Not sure where to start?</p>
        <h2 class="h2" id="find-h">What brings you in?</h2>
        <p class="sec-sub">Pick what’s bothering you to see which treatments and practitioners fit, then book with them directly.</p>
      </div>
    </div>
    <div class="chips" role="tablist" aria-label="Choose a concern" data-tabs>
      ${C.CONCERNS.map((c, i) => `<button type="button" role="tab" class="chip${i ? '' : ' is-on'}" id="chip-${c.id}" aria-controls="need-${c.id}" aria-selected="${i ? 'false' : 'true'}"${i ? ' tabindex="-1"' : ''}>${esc(c.label)}</button>`).join('')}
    </div>
    <div class="match-box">${matcher}
    </div>
  </div>
</section>

<section class="section section-paper" aria-labelledby="svc-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">Our services</p>
        <h2 class="h2" id="svc-h">Twelve ways we treat pain, injury and stress</h2>
      </div>
      <a class="link-arrow" href="services/">Compare all services ${icon('arrow')}</a>
    </div>
    <ul class="svc-grid">${SERVICES.map(s => serviceCard(root, s)).join('')}</ul>
  </div>
</section>

<section class="section about-band" aria-labelledby="about-h">
  <div class="wrap about-in">
    <div class="about-photos">
      ${pic(root, 'clinic/reception-logo-wall', 'OSTEO+ reception with the gold logo on the wall', { cls: 'ap-1' })}
      ${pic(root, 'clinic/waiting-area', 'The calm waiting area at OSTEO+', { cls: 'ap-2' })}
      ${pic(root, 'clinic/normatec-on-table', 'NormaTec recovery boots on a treatment table', { cls: 'ap-3' })}
    </div>
    <div class="about-copy">
      <p class="eyebrow">About OSTEO+</p>
      <h2 class="h2" id="about-h">Compassionate, whole-body care, on Disera Drive</h2>
      <p>${esc(C.ABOUT[0])}</p>
      <p>${esc(C.ABOUT[1])}</p>
      <ul class="ticks">
        <li>${icon('check')}Specializing in chronic pain management and wellness</li>
        <li>${icon('check')}Six disciplines that refer to each other, under one roof</li>
        <li>${icon('check')}Online booking and intake forms through Jane</li>
      </ul>
      <a class="btn btn-ink" href="about-us/">Meet the team ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section team-sec" aria-labelledby="team-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">Our practitioners</p>
        <h2 class="h2" id="team-h">The people who’ll treat you</h2>
      </div>
      <div class="rail-nav" data-rail-nav><button type="button" aria-label="Scroll team left" data-dir="-1">${icon('arrow', 'i flip')}</button><button type="button" aria-label="Scroll team right" data-dir="1">${icon('arrow')}</button></div>
    </div>
    <ul class="team-rail" data-rail>${TEAM.map(t => teamCard(root, t)).join('')}</ul>
  </div>
</section>

<section class="section quote-sec" aria-labelledby="quote-h">
  <div class="wrap quote-in">
    <h2 class="sr" id="quote-h">What clients say</h2>
    <figure class="quote">
      <blockquote><p>${esc(C.TESTIMONIAL.text)}</p></blockquote>
      <figcaption>${pic(root, C.TESTIMONIAL.photo, '')}<span><b>${C.TESTIMONIAL.name}</b><small>First-time osteopathy client</small></span></figcaption>
    </figure>
  </div>
</section>

<section class="section section-paper" aria-labelledby="visit-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">Your first visit</p>
        <h2 class="h2" id="visit-h">What happens when you book</h2>
      </div>
    </div>
    <ol class="steps">
      <li><span class="step-n">1</span><h3>Book online</h3><p>Choose a practitioner and time on our Jane booking page, or call the front desk at ${SITE.phone}.</p></li>
      <li><span class="step-n">2</span><h3>Fill in your intake</h3><p>Complete the online intake form and profile before you arrive. Upload any X-ray, ultrasound or MRI reports.</p></li>
      <li><span class="step-n">3</span><h3>Come comfortable</h3><p>Wear loose clothing you can move in, skip a big meal 2–3 hours before, and arrive on time for your full session.</p></li>
      <li><span class="step-n">4</span><h3>Assessment &amp; treatment</h3><p>Your practitioner reviews your history, examines you and builds a plan around the root cause.</p></li>
      <li><span class="step-n">5</span><h3>Aftercare</h3><p>Hydrate, sleep well and keep movement gentle. Some soreness for a day or two is normal.</p></li>
    </ol>
    <div class="price-teaser">
      <div>
        <h3 class="h3">Clear prices, before you book</h3>
        <p>Massage from $90, acupuncture from $80 (no HST), osteopathy from $100. Every session length and price is on one page.</p>
      </div>
      <a class="btn btn-ink" href="pricing/">See pricing ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="blog-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">From the blog</p>
        <h2 class="h2" id="blog-h">Latest from our practitioners</h2>
      </div>
      <a class="link-arrow" href="blog/">All posts ${icon('arrow')}</a>
    </div>
    <div class="post-grid" data-latest-posts>${latest.map(p => postCard(p, root)).join('')}</div>
  </div>
</section>

${socialSection(root)}

<section class="section section-paper" aria-labelledby="faq-h">
  <div class="wrap faq-wrap">
    <div>
      <p class="eyebrow">Questions</p>
      <h2 class="h2" id="faq-h">Frequently asked</h2>
      <p class="sec-sub">Still wondering about something? Call ${SITE.phone} or email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
      <a class="link-arrow" href="faqs/">All FAQs ${icon('arrow')}</a>
    </div>
    ${faqList([C.FAQS[0], C.FAQS[2], C.FAQS[10], C.FAQS[7], C.FAQS[5]], 0)}
  </div>
</section>

<section class="section" id="visit" aria-label="Location and hours">
  <div class="wrap">${visitBlock(root)}</div>
</section>`;

  write('index.html', page({
    root, current: 'home', main,
    meta: {
      title: 'OSTEO+ | Osteopathy & Chronic Pain Clinic in Thornhill, ON',
      desc: 'OSTEO+ is an osteopathy clinic in Thornhill offering osteopathy, physiotherapy, athletic therapy, RMT massage, acupuncture and naturopathy. Book online.',
      path: '', jsonld: [businessLd(), { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url + '/' }]
    }
  }));
}

/* ================= SERVICE PAGES ================= */
function buildService(s) {
  const d = C.SERVICE_PAGES[s.slug];
  const p = s.path, root = rootFor(p);
  const pr = priceFor(s.slug);
  const who = offering(s.slug);
  const list = items => `<ul class="ticks">${items.map(x => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>`;
  const defs = items => `<dl class="defs">${items.map(([t, x]) => `<div><dt>${esc(t)}</dt><dd>${esc(x)}</dd></div>`).join('')}</dl>`;
  const paras = arr => arr.map(x => `<p>${esc(x)}</p>`).join('');
  let body = `<h2>${esc(d.q)}</h2>${paras(d.what)}`;
  if (d.helps) body += `<h3>Commonly used for</h3><ul class="pills">${d.helps.map(h => `<li>${esc(h)}</li>`).join('')}</ul>`;
  if (d.symptoms) body += `<h2>Common symptoms of TMJ disorder</h2>${list(d.symptoms)}`;
  if (d.approaches) body += `<h2>How we treat TMJ</h2>${d.approaches.map(([h, items]) => `<h3>${esc(h)}</h3>${defs(items)}`).join('')}`;
  if (d.fascia) body += `<h2>What is fascia?</h2>${defs(d.fascia)}`;
  if (d.techniques) body += `<h2>Techniques we use</h2>${defs(d.techniques)}`;
  if (d.steps) body += `<h2>${s.slug === 'fascial-stretch-therapy' ? 'How Fascial Stretch Therapy works' : 'What to expect'}</h2><ol class="num-steps">${d.steps.map(([t, x]) => `<li><b>${esc(t)}</b><span>${esc(x)}</span></li>`).join('')}</ol>`;
  if (d.benefits) body += `<h2>Benefits</h2>${list(d.benefits)}`;
  if (d.who) body += `<h2>Who is it for?</h2>${defs(d.who)}`;
  if (d.note) body += `<p class="callout">${esc(d.note).replace('blog post on lymphatic drainage and buccal facial massage', `<a href="${root}post/the-natural-botox-alternative-you-need-to-know-about-lymphatic-drainage-buccal-facial-massage-at/">blog post on lymphatic drainage and buccal facial massage</a>`)}</p>`;
  if (d.prep) body += `<h2>How to prepare for treatment</h2>${list(d.prep)}`;
  if (d.expect) body += `<h2>${d.steps ? 'Good to know' : 'What to expect'}</h2>${paras(d.expect)}`;
  if (d.after) body += `<h2>What to expect after treatment</h2>${paras(d.after)}`;

  const related = SERVICES.filter(x => x.slug !== s.slug && (x.group === s.group)).slice(0, 3);
  const consult = FREE_CONSULT.includes(s.slug);
  const aside = `<aside class="svc-aside">
      ${pr ? `<div class="aside-card">${priceCard(pr, { book: false }).replace('<h3 class="price-h">', '<h2 class="price-h">').replace(/<\/h3>/, '</h2>')}
        ${consult ? `<p class="consult">${icon('check')}<a href="${consultFor(s.slug).url}" target="_blank" rel="noopener">Book a free 15-minute initial consultation</a></p>` : ''}
        ${bookBtn(s.book, `Book ${s.short.toLowerCase()}`, 'btn btn-gold btn-wide')}
        <a class="small-link" href="${root}pricing/">All prices</a>
      </div>` : `<div class="aside-card"><h2 class="price-h">Included in treatment</h2><p class="muted">${s.slug === 'cupping-therapy' ? 'Cupping is added within osteopathy, massage, therapeutic sports massage or acupuncture sessions.' : 'Taping is applied during athletic therapy sessions.'}</p>
        ${bookBtn(SITE.booking, 'Book appointment', 'btn btn-gold btn-wide')}</div>`}
      ${who.length ? `<div class="aside-card"><h2 class="price-h">Who offers it</h2><ul class="minis">${who.map(t => teamMini(root, t)).join('')}</ul></div>` : ''}
    </aside>`;

  const main = `
<section class="page-hero svc-hero">
  <div class="wrap svc-hero-in">
    <div>
      ${crumbs(root, [['Home', ''], ['Services', 'services/'], [s.name, p]])}
      <p class="eyebrow">${esc(GROUPS[s.group])}</p>
      <h1 class="h1">${esc(d.title)}</h1>
      <p class="lede">${esc(d.what[0])}</p>
      <div class="btn-row">${bookBtn(pr || s.disc ? s.book : SITE.booking, 'Book now')}${callBtn()}</div>
    </div>
    <figure class="svc-hero-img">${pic(root, s.img, `${s.name} at ${SITE.name}`, { lazy: false })}</figure>
  </div>
</section>
<section class="section svc-main">
  <div class="wrap svc-layout">
    <div class="prose">${body}</div>
    ${aside}
  </div>
</section>
<section class="section section-paper">
  <div class="wrap">
    <div class="sec-head"><h2 class="h2">Related treatments</h2><a class="link-arrow" href="${root}services/">All services ${icon('arrow')}</a></div>
    <ul class="svc-grid svc-grid-3">${related.map(r => serviceCard(root, r)).join('')}</ul>
  </div>
</section>`;

  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'MedicalTherapy', name: s.name, description: d.what[0], url: abs(p),
      provider: { '@id': SITE.url + '/#clinic', '@type': 'MedicalClinic', name: SITE.name },
      ...(pr ? { offers: pr.rows.map(([len, amt]) => ({ '@type': 'Offer', name: `${pr.name} ${len}`, price: amt, priceCurrency: 'CAD' })) } : {})
    },
    crumbsLd([['Home', ''], ['Services', 'services/'], [s.name, p]])
  ];
  write(p + 'index.html', page({ root, current: s.slug, main, meta: { title: d.metaTitle, desc: d.desc, path: p, image: `assets/img/${s.img}.webp`, imageAlt: s.name, jsonld: ld } }));
}

/* ================= SERVICES OVERVIEW ================= */
function buildServices() {
  const p = 'services/', root = rootFor(p);
  const rows = SERVICES.map(s => {
    const pr = priceFor(s.slug);
    return `<tr><th scope="row"><a href="${root}${s.path}">${esc(s.name)}</a></th><td>${esc(s.blurb)}</td><td>${pr ? pr.rows.map(r => r[0]).join(', ') : 'Within other treatments'}</td><td>${pr ? 'From ' + money(fromPrice(s.slug)) : '—'}</td><td>${pr ? (pr.tax === C.NO_HST ? 'No HST' : 'HST may apply') : '—'}</td></tr>`;
  }).join('');
  const main = `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Services', p]])}
    <p class="eyebrow">Our services</p>
    <h1 class="h1">Treatments at OSTEO+ Thornhill</h1>
    <p class="lede">OSTEO+ offers osteopathy, physiotherapy, athletic therapy, registered massage therapy, therapeutic sports massage, fascial stretch therapy, TMJ treatment, acupuncture, cupping, naturopathy, Brazilian lymphatic drainage and kinesiology taping, all in one clinic on Disera Drive.</p>
  </div>
</section>
${Object.entries(GROUPS).map(([g, label], i) => `<section class="section${i % 2 ? ' section-paper' : ''}">
  <div class="wrap">
    <h2 class="h2 sec-title">${esc(label)}</h2>
    <ul class="svc-grid">${SERVICES.filter(s => s.group === g).map(s => serviceCard(root, s, 'h3')).join('')}</ul>
  </div>
</section>`).join('')}
<section class="section">
  <div class="wrap">
    <h2 class="h2 sec-title">Every service, side by side</h2>
    <div class="table-scroll"><table class="compare">
      <thead><tr><th scope="col">Service</th><th scope="col">What it’s for</th><th scope="col">Session lengths</th><th scope="col">Price</th><th scope="col">Tax</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>
</section>`;
  write(p + 'index.html', page({
    root, current: 'services', main,
    meta: {
      title: 'Services | Osteopathy, Physio, RMT & More | OSTEO+ Thornhill',
      desc: 'Compare every OSTEO+ Thornhill service: osteopathy, physiotherapy, athletic therapy, massage, acupuncture, naturopathy, lymphatic drainage and more. Book online.',
      path: p, jsonld: [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: SERVICES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: abs(s.path) })) }, crumbsLd([['Home', ''], ['Services', p]])]
    }
  }));
}

/* ================= ABOUT + TEAM ================= */
function buildAbout() {
  const p = 'about-us/', root = rootFor(p);
  const main = `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['About us', p]])}
    <p class="eyebrow">About OSTEO+</p>
    <h1 class="h1">A Thornhill clinic built around chronic pain and wellness</h1>
    <p class="lede">${SITE.name} is an osteopathy clinic at ${SITE.street} in ${SITE.city}, Ontario, co-founded by osteopath and RMT Anna Guimadeev, with osteopath Justin Marco as CEO and clinic director.</p>
  </div>
</section>
<figure class="wide-photo wrap">${pic(root, 'clinic/osteo-plus-team-thornhill', 'The OSTEO+ team sitting together in front of the clinic’s gold logo wall', { lazy: false })}</figure>
<section class="section">
  <div class="wrap about-two">
    <div class="prose">
      <h2>Our commitment</h2>
      ${C.ABOUT.map(x => `<p>${esc(x)}</p>`).join('')}
    </div>
    <ul class="values">
      <li><h3>Whole-body</h3><p>Osteopathy looks for the root cause, not just the sore spot, and the rest of the team works the same way.</p></li>
      <li><h3>Under one roof</h3><p>Osteopathy, physio, athletic therapy, massage, acupuncture and naturopathy, so your care isn’t in a silo.</p></li>
      <li><h3>Personal</h3><p>Every plan is built around your history, your goals and how your body responds.</p></li>
    </ul>
  </div>
</section>
<section class="section section-paper" id="team">
  <div class="wrap">
    <div class="sec-head"><div><p class="eyebrow">Our team</p><h2 class="h2">Meet the practitioners</h2></div></div>
    <ul class="team-grid">${TEAM.map(t => teamCard(root, t)).join('')}</ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="sec-head"><div><p class="eyebrow">The clinic</p><h2 class="h2">Inside OSTEO+</h2></div></div>
    <div class="gallery">
      ${pic(root, 'clinic/reception-logo-wall', 'Reception area with the OSTEO+ logo')}
      ${pic(root, 'clinic/treatment-room-window', 'Treatment room with a large window')}
      ${pic(root, 'clinic/osteopath-definition-wall', 'Wall decal defining the word osteopath')}
      ${pic(root, 'clinic/waiting-area', 'Waiting area with white chairs')}
      ${pic(root, 'clinic/skeleton-model', 'Anatomical skeleton model and charts in a treatment room')}
      ${pic(root, 'clinic/normatec-recovery-boots', 'NormaTec recovery boots hanging on the wall')}
    </div>
  </div>
</section>
<section class="section quote-sec">
  <div class="wrap quote-in">
    <figure class="quote">
      <blockquote><p>${esc(C.TESTIMONIAL.text)}</p></blockquote>
      <figcaption>${pic(root, C.TESTIMONIAL.photo, '')}<span><b>${C.TESTIMONIAL.name}</b><small>First-time osteopathy client</small></span></figcaption>
    </figure>
  </div>
</section>`;
  write(p + 'index.html', page({
    root, current: 'about', main,
    meta: {
      title: 'About Us & Our Team | OSTEO+ Osteopathy Clinic Thornhill',
      desc: 'Meet the OSTEO+ team in Thornhill: osteopaths, a physiotherapist, an athletic therapist, RMTs, acupuncturists and naturopathic doctors. Book with any of them online.',
      path: p, jsonld: [businessLd(), crumbsLd([['Home', ''], ['About us', p]])]
    }
  }));
}

function buildTeam(t) {
  const b = C.BIOS[t.slug];
  const p = t.path, root = rootFor(p);
  const svcs = t.services.map(service);
  const others = TEAM.filter(x => x.slug !== t.slug);
  const main = `
<section class="section bio">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Our team', 'about-us/'], [t.name, p]])}
    <div class="bio-in">
      <figure class="bio-photo"><img src="${root}${t.photo}" alt="${esc(t.name)}, ${esc(t.role.split(' · ')[0])} at ${SITE.name}" width="720" height="900" fetchpriority="high"></figure>
      <div class="bio-copy">
        <p class="eyebrow">${esc(t.role)}</p>
        <h1 class="h1">${esc(t.name)}</h1>
        <div class="btn-row">
          ${bookBtn(t.book, t.jane ? `Book with ${t.first}` : 'Book appointment')}
          ${callBtn()}
        </div>
        ${t.jane ? '' : `<p class="muted small">To book with ${esc(t.first)}, call the front desk or choose from the online booking page.</p>`}
        <div class="prose">${b.bio.map(x => `<p>${esc(x)}</p>`).join('')}</div>
        <div class="bio-facts">
          <div><h2 class="h4">Training &amp; memberships</h2><ul class="ticks">${b.creds.map(c => `<li>${icon('check')}${esc(c)}</li>`).join('')}</ul></div>
          ${b.focus ? `<div><h2 class="h4">Areas of focus</h2><ul class="pills">${b.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
          ${b.languages ? `<div><h2 class="h4">Languages</h2><p>${esc(b.languages)}</p></div>` : ''}
          <div><h2 class="h4">Treatments</h2><ul class="pills pills-link">${svcs.map(s => `<li><a href="${root}${s.path}">${esc(s.name)}</a></li>`).join('')}</ul></div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section section-paper">
  <div class="wrap">
    <div class="sec-head"><h2 class="h2">More of the team</h2><div class="rail-nav" data-rail-nav><button type="button" aria-label="Scroll left" data-dir="-1">${icon('arrow', 'i flip')}</button><button type="button" aria-label="Scroll right" data-dir="1">${icon('arrow')}</button></div></div>
    <ul class="team-rail" data-rail>${others.map(o => teamCard(root, o)).join('')}</ul>
  </div>
</section>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Person', name: t.name, jobTitle: t.role.split(' · ')[0], image: abs(t.photo), url: abs(p),
    worksFor: { '@type': 'MedicalClinic', '@id': SITE.url + '/#clinic', name: SITE.name },
    hasCredential: b.creds.map(c => ({ '@type': 'EducationalOccupationalCredential', name: c })),
    ...(b.languages ? { knowsLanguage: b.languages.split(' and ') } : {})
  }, crumbsLd([['Home', ''], ['Our team', 'about-us/'], [t.name, p]])];
  const plainName = t.name.replace(/, (RMT|ND)$/, '');
  write(p + 'index.html', page({
    root, current: 'about', main,
    meta: {
      title: `${plainName}, ${b.short} | OSTEO+ Thornhill`,
      desc: `Meet ${plainName}, ${b.short} at OSTEO+ in Thornhill. ${b.creds[0]}. Read the full bio and book online.`,
      path: p, image: t.photo, imageAlt: t.name, type: 'profile', jsonld: ld
    }
  }));
}

/* ================= PRICING ================= */
function buildPricing() {
  const p = 'pricing/', root = rootFor(p);
  const main = `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Pricing', p]])}
    <p class="eyebrow">Pricing</p>
    <h1 class="h1">Treatment prices at OSTEO+</h1>
    <p class="lede">Sessions start at $80 for 30 minutes of acupuncture or fascial stretch therapy. Osteopathy is $100–$155, massage therapy $90–$170, and physiotherapy $100–$150. Acupuncture, naturopathy and physiotherapy have no HST; HST applies to other services based on the service.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="price-grid">${C.PRICING.map(pr => priceCard(pr)).join('')}</div>
    <div class="notes-grid">
      <div class="note-card"><h2 class="h4">Free 15-minute consultations</h2><p>An initial consultation at no charge is available for osteopathy, acupuncture and athletic therapy. Our naturopathic doctor offers a free 15-minute phone consultation.</p></div>
      <div class="note-card"><h2 class="h4">Insurance</h2><p>Coverage depends on your plan, but most insurance companies cover osteopathic treatment. RMT massage comes with RMT receipts. Check your plan for details.</p></div>
      <div class="note-card"><h2 class="h4">Cupping &amp; taping</h2><p>Cupping and kinesiology taping are used within other treatments, such as osteopathy, massage, acupuncture and athletic therapy, rather than booked on their own.</p></div>
    </div>
    <div class="btn-row center">${bookBtn(SITE.booking, 'Book appointment')}${callBtn()}</div>
  </div>
</section>`;
  const offers = C.PRICING.flatMap(pr => pr.rows.map(([len, amt]) => ({ '@type': 'Offer', name: `${pr.name}, ${len}`, price: amt, priceCurrency: 'CAD' })));
  write(p + 'index.html', page({
    root, current: 'pricing', main,
    meta: {
      title: 'Pricing | Osteopathy, Massage & Acupuncture Rates | OSTEO+',
      desc: 'OSTEO+ Thornhill prices: osteopathy from $100, massage from $90, acupuncture from $80, physiotherapy from $100, naturopathy from $120. See every rate, then book.',
      path: p, jsonld: [{ '@context': 'https://schema.org', '@type': 'OfferCatalog', name: `${SITE.name} treatment prices`, url: abs(p), itemListElement: offers }, crumbsLd([['Home', ''], ['Pricing', p]])]
    }
  }));
}

/* ================= FAQ ================= */
function buildFaqs() {
  const p = 'faqs/', root = rootFor(p);
  const osteo = C.FAQS.slice(0, 8), visit = C.FAQS.slice(8);
  const main = `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['FAQs', p]])}
    <p class="eyebrow">FAQs</p>
    <h1 class="h1">Frequently asked questions</h1>
    <p class="lede">Answers about osteopathy, booking, pricing and your first visit to OSTEO+ in Thornhill. Can’t find yours? Call ${SITE.phone}.</p>
  </div>
</section>
<section class="section">
  <div class="wrap faq-page">
    <div><h2 class="h3 faq-group">About osteopathy</h2>${faqList(osteo, 0)}</div>
    <div><h2 class="h3 faq-group">Visiting OSTEO+</h2>${faqList(visit)}</div>
  </div>
</section>`;
  write(p + 'index.html', page({
    root, current: 'faqs', main,
    meta: { title: 'FAQs | Osteopathy Questions Answered | OSTEO+ Thornhill', desc: 'What is osteopathy, is it safe, how many sessions you need, insurance coverage, free consultations and how to prepare. Answers from OSTEO+ in Thornhill.', path: p, jsonld: [faqLd(C.FAQS), crumbsLd([['Home', ''], ['FAQs', p]])] }
  }));
}

/* ================= CONTACT ================= */
function buildContact() {
  const p = 'contact-us/', root = rootFor(p);
  const main = `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Contact', p]])}
    <p class="eyebrow">Contact</p>
    <h1 class="h1">Contact OSTEO+ in Thornhill</h1>
    <p class="lede">Call <a href="tel:${SITE.tel}">${SITE.phone}</a>, email <a href="mailto:${SITE.email}">${SITE.email}</a>, or visit us at ${SITE.street}, ${SITE.city} (second floor). The fastest way to get an appointment is to book online.</p>
  </div>
</section>
<section class="section">
  <div class="wrap contact-grid">
    <form class="contact-form" data-contact-form novalidate>
      <h2 class="h3">Send us a message</h2>
      <div class="field-row">
        <label class="field"><span>Name</span><input name="name" required autocomplete="name"></label>
        <label class="field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel"></label>
      </div>
      <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>Interested in</span>
        <select name="service"><option value="">Not sure yet</option>${SERVICES.map(s => `<option>${esc(s.name)}</option>`).join('')}</select>
      </label>
      <label class="field"><span>Message</span><textarea name="message" rows="5" required></textarea></label>
      <button class="btn btn-gold" type="submit">Send message</button>
      <p class="form-status" role="status" data-form-status></p>
      <p class="muted small">Please don’t include detailed medical information in this form. For bookings, use our <a href="${SITE.booking}" target="_blank" rel="noopener">online booking page</a>.</p>
    </form>
    ${visitBlock(root, { map: false })}
  </div>
  <div class="wrap"><div class="visit-map visit-map-wide"><iframe title="Map showing ${SITE.name} at ${SITE.street}, ${SITE.city}" src="https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&amp;z=15&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div>
</section>`;
  write(p + 'index.html', page({
    root, current: 'contact', main,
    meta: { title: 'Contact Us | OSTEO+ Thornhill | (289) 588-3124', desc: 'OSTEO+ is at 10 Disera Dr, Unit 200, Thornhill. Open Mon–Thu 10–8, Fri 10–2, Sat 9–2. Call (289) 588-3124, email info@osteo-plus.ca, or book online.', path: p, jsonld: [businessLd(), crumbsLd([['Home', ''], ['Contact', p]])] }
  }));
}

/* ================= SHOP + 404 ================= */
function buildShop() {
  const p = 'shop/', root = rootFor(p);
  const main = `
<section class="page-hero page-hero-tall">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Shop', p]])}
    <p class="eyebrow">Shop</p>
    <h1 class="h1">The OSTEO+ shop is coming soon</h1>
    <p class="lede">Wellness products chosen by our practitioners will be available here. In the meantime, ask at the front desk or book a treatment.</p>
    <div class="btn-row">${bookBtn(SITE.booking, 'Book appointment')}<a class="btn btn-line" href="${root}services/">Browse services</a></div>
  </div>
</section>`;
  write(p + 'index.html', page({ root, current: '', main, meta: { title: 'Shop | OSTEO+ Thornhill', desc: 'The OSTEO+ wellness shop is coming soon. Book a treatment online or ask the front desk about products in the meantime.', path: p, noindex: true } }));
}

function build404() {
  // Served at any depth on GitHub Pages, so it uses absolute site links.
  const root = SITE.url + '/';
  const main = `
<section class="page-hero page-hero-tall">
  <div class="wrap">
    <p class="eyebrow">Page not found</p>
    <h1 class="h1">We couldn’t find that page</h1>
    <p class="lede">It may have moved when our website was rebuilt. Try one of these instead.</p>
    <div class="btn-row">${bookBtn(SITE.booking, 'Book appointment')}<a class="btn btn-line" href="${root}">Home</a><a class="btn btn-line" href="${root}services/">Services</a><a class="btn btn-line" href="${root}blog/">Blog</a></div>
  </div>
</section>`;
  write('404.html', page({ root, current: '', main, meta: { title: 'Page not found | OSTEO+', desc: 'This page could not be found. Visit the OSTEO+ home page or book online.', path: '404.html', noindex: true } }));
}

/* ================= OLD WIX ADDRESSES ================= */
function redirect(from, to) {
  const url = abs(to);
  write(from + '/index.html', `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><title>Moved | ${SITE.name}</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${rootFor(from + '/')}${to}">
</head><body><p>This page has moved to <a href="${rootFor(from + '/')}${to}">${url}</a>.</p></body></html>
`);
}

/* ================= RUN ================= */
buildHome();
buildServices();
SERVICES.forEach(buildService);
buildAbout();
TEAM.forEach(buildTeam);
buildPricing();
buildFaqs();
buildContact();
buildShop();
build404();
write('blog/index.html', OP.blogIndex(posts));
posts.filter(p => p.status !== 'draft').forEach(p => write(`post/${p.slug}/index.html`, OP.postPage(p, posts)));

const moved = {
  'soft-tissue-therapy': 'massage-therapy/', 'recovery-therapy': 'fascial-stretch-therapy/', brazilianlymphaticdrainagemassage: 'lymphatic-drainage-massage/',
  'copy-of-fascial-stretch-therapy': 'naturopathy/', 'copy-of-fascial-stretch-therapy-1': 'physiotherapy/', 'copy-of-naturopathy': 'tmj/', 'copy-of-tmj': 'therapeutic-sports-massage/'
};
Object.entries(C.BIOS).forEach(([slug, b]) => (moved[b.old] = `team/${slug}/`));
Object.entries(moved).forEach(([from, to]) => redirect(from, to));

// Pages listed in the sitemap (blog posts are added from data/posts.json by shared.sitemap).
const sitePages = ['', 'about-us/', 'services/', ...SERVICES.map(s => s.path), ...TEAM.map(t => t.path), 'pricing/', 'faqs/', 'contact-us/', 'blog/'].map(path => ({ path }));
write('data/site-pages.json', JSON.stringify({ pages: sitePages }, null, 1) + '\n');
write('sitemap.xml', OP.sitemap(sitePages, posts));
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

console.log(`Built ${written.length} files.`);
