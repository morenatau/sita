# SITA site

Static site. No build step, no dependencies — edit the files and deploy.

## Layout

```
index.html                  markup only (~36 KB): nav, home, contact, invitations
assets/css/                 stylesheets, loaded in numeric order
assets/js/                  behaviour, one file per feature
assets/img/                 images (were base64 data URIs)
documents/                  tender PDFs/DOCX/XLSX linked from the invitations page
vercel.json                 rewrites /contact and /tenders/invitations to index.html
index.html.original         the old single-file version, kept for reference (not deployed)
```

## CSS

Loaded in order — later files override earlier ones, so keep the numbering.

| File | Covers |
| --- | --- |
| `00-route-boot.css` | shows the right page on first paint, before the rest loads |
| `01-base.css` | reset, body type, `.page` show/hide |
| `02-top-bar.css` | green/blue utility strip |
| `03-nav.css` | navbar, mega menu, hamburger |
| `04-hero.css` | hero carousel, `.container` |
| `05-home.css` | icon row, about, projects, quote band |
| `06-footer.css` | footer |
| `07-page-header.css` | breadcrumb header on inner pages |
| `08-tenders.css` | tender tables, download menus, database CTA |
| `09-contact.css` | map, contact columns, province tabs, office table |
| `10-responsive.css` | all `@media` rules (≤900px, ≤480px) |

Mobile rules live only in `10-responsive.css`. When you add a component, put its
desktop rules in the matching file and its mobile rules at the bottom.

## JS

Plain scripts (not modules), loaded at the end of `<body>`, so top-level functions
stay global — that's what the `onclick="showPage('home')"` attributes in the markup
call. Don't add `type="module"` or the inline handlers break.

| File | Covers |
| --- | --- |
| `route-boot.js` | runs in `<head>`; sets `data-route` before first paint so deep links don't flash the home page |
| `quote-carousel.js` | quote band slider (`quoteGo`) |
| `hero-carousel.js` | hero slider (`heroMove`, `heroGo`) |
| `router.js` | client-side routing, `showPage`, history/popstate |
| `nav.js` | mobile nav toggle, mega-menu open/close |
| `downloads.js` | tender download dropdowns (`toggleDlMenu`, `downloadAllFiles`) |
| `tabs.js` | generic `.tab-btn` / `.tab-panel` handler (no markup uses it yet) |

## Adding a page

1. Add `<div id="page-yourname" class="page">…</div>` in `index.html`.
2. Add the route to `PAGE_PATHS` **and** `PATH_PAGES` in `assets/js/router.js`,
   and to the same `PATH_PAGES` map in `assets/js/route-boot.js`.
3. Add the selector to `assets/css/00-route-boot.css`.
4. Add a rewrite in `vercel.json` so a direct hit on the URL serves `index.html`.

## Asset paths

All asset URLs are root-absolute (`/assets/...`). They must be — `/tenders/invitations`
serves `index.html` from a nested path, and relative URLs would resolve against
`/tenders/`. For the same reason, open the site through a server rather than
double-clicking `index.html`:

```bash
python3 -m http.server 8000
```
