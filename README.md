# OSTEO+ website (prototype)

Redesign of [osteo-plus.ca](https://www.osteo-plus.ca) (Wix) for OSTEO+, the osteopathy and chronic pain clinic at 10 Disera Dr, Unit 200, Thornhill ON L4J 0A7.
Prototype: https://jdix22.github.io/osteo-plus/ (set to `noindex` until the clinic approves it).

Everything on the old site is here: all 12 services, the current team, pricing (matching Jane), FAQs, contact details, hours, testimonial, the 5 blog posts and the clinic's own photos. Booking stays on Jane (osteo-plus.janeapp.com); every practitioner with a Jane profile gets a direct "Book with …" link.

## What's new
- Home: "What brings you in?" matcher (pick a concern, see matching treatments and practitioners with Book buttons), live "Open now" status, service cards with prices, team carousel, first-visit steps, latest posts, Instagram feed, FAQ, map.
- A page per service and per practitioner, a services comparison table, pricing page, FAQ page, contact form.
- SEO: real text on every page, unique titles/descriptions, structured data (clinic, services, people, blog posts, FAQs, breadcrumbs), sitemap, social preview image, fast WebP photos with descriptive names.
- Every old Wix address still works (old service and team URLs forward to the new pages; blog post addresses are unchanged).

## Blog manager (`/admin/`)
The clinic writes and edits posts at `/admin/` with a password. Publishing builds the post page, updates the blog, the home page and the sitemap in one step.

One-time setup (Jordan):
1. On GitHub, create a fine-grained token for `jdix22/osteo-plus` only, with **Contents: Read and write**.
2. Open https://jdix22.github.io/osteo-plus/admin/, paste the token, choose the clinic's password. The token is stored encrypted in `admin/vault.json`.
3. Give the clinic the password (not the token).

## Instagram feed
The "OSTEO+ on Instagram" section near the bottom of the home page shows @osteoplus_'s latest posts from Behold (JSON feed `p46l0vsEi0LqWT2DwDXc`, set in `data/social.json`). It updates itself. Clinic photos show as a fallback if the feed can't load. To change the feed: /admin/ > Instagram feed, paste the new feed ID, Publish. (TikTok and Facebook feeds were removed at Jordan's request; their icons still link to the accounts.)

## Editing the site
Content lives in `_src/content.js` (services, bios, prices, FAQs) and `assets/js/shared.js` (address, phone, hours, team list, Jane ids). Rebuild with `node _src/build.js`. Bump `BUILD` in shared.js on every change so browsers fetch the new CSS/JS.

## Questions for the clinic
Settled (Jordan, 5 Nov 2026): Dr. Flora and Thalia removed (old addresses forward to the team page); Fanda Wong stays (not on Jane yet, so her Book button goes to the general booking page); Marco De Palma added with his Jane photo and bio; all prices now match Jane.

1. **Fanda Wong** isn't on the Jane booking page. Add her there so she gets a direct "Book with Fanda" link?
2. When prices change on Jane, update `PRICING` in `_src/content.js` (and the "from $" lines in service descriptions) to match.
3. The site advertises the **free 15-minute initial consultation** (osteopathy, acupuncture, athletic therapy) and Dr. Angelica's **free phone consultation**, taken from Jane. OK to show?
4. Hours show **Sunday closed** (the old site lists Mon–Sat only). Correct?
5. The FAQ says RMT massage comes with **RMT receipts**. True for all RMTs? Do you direct-bill insurance?
6. Steve's surname (Shelmov) and Dr. Angelica's surname (Dimita) come from Jane and the blog. OK to show? Is Sammy a Registered Massage Therapist?
7. **Google reviews:** the home page shows "Rated 5.0 on Google from 120+ client reviews" (as on Google, 9 Nov 2026) with a link to the Google listing. The rating is typed in (SITE.google in shared.js), so update it if it changes. To show individual reviews, send the ones you want (and that reviewers are OK being quoted).
9. **Award badges:** done (Canadian Choice Award Winner 2025 and 2026, top-right of the home hero; files in assets/img/brand/). Add future years to `awards` in shared.js with a matching image.
8. Contact form currently opens the visitor's email app. Want it to send directly (free form service)?

## Going live on osteo-plus.ca
1. In `assets/js/shared.js`: `url: 'https://www.osteo-plus.ca'`, `noindex: false`. Rebuild.
2. Host (Cloudflare Worker like Jordan's other client sites, or GitHub Pages with a custom domain) and point the domain away from Wix.
3. Submit the sitemap in Google Search Console and claim/refresh the Google Business Profile so the hours, phone and website match the site.
