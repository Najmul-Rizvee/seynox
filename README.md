# Seynox IT Solutions — Website

Marketing site for Seynox IT Solutions, built with **Design Canvas** (`.dc.html`
files — a Claude Design export format, not a JS framework you build). No build
step: files are deployed as-is.

## Live pipeline

`git push origin main` → Hostinger's Git integration auto-pulls and deploys to
`seynox.com` (hPanel → Websites → seynox.com → Git). No manual deploy step.

## Folder structure

```
components/         Shared partials, pulled into pages via <dc-import name="...">
  site-header.dc.html
  site-footer.dc.html
  page-hero.dc.html
  cta-band.dc.html
  proof-band.dc.html
  lead-form.dc.html

pages/               One file per URL. Grouped by section for discoverability.
  home.dc.html               -> /
  services.dc.html           -> /services        (overview)
  about.dc.html               -> /about
  contact.dc.html             -> /contact
  faq.dc.html                 -> /faq
  field-notes.dc.html         -> /field-notes
  handover-pack.dc.html       -> /handover-pack
  industries.dc.html          -> /industries      (overview)
  locations.dc.html           -> /locations       (overview)
  pricing.dc.html              -> /pricing
  privacy.dc.html              -> /privacy
  terms.dc.html                -> /terms
  services/
    managed-it.dc.html               -> /managed-it
    cloud-microsoft-365.dc.html      -> /cloud-microsoft-365
    cybersecurity.dc.html            -> /cybersecurity
    it-consulting.dc.html            -> /it-consulting
  industries/
    accounting-it-support.dc.html         -> /accounting-it-support
    legal-it-support.dc.html              -> /legal-it-support
    professional-services-it.dc.html      -> /professional-services-it
  locations/
    it-support-vancouver.dc.html    -> /it-support-vancouver
    it-support-burnaby.dc.html      -> /it-support-burnaby
    it-support-surrey.dc.html       -> /it-support-surrey
    it-support-coquitlam.dc.html    -> /it-support-coquitlam
    it-support-langley.dc.html      -> /it-support-langley
    it-support-chilliwack.dc.html   -> /it-support-chilliwack
    it-support-white-rock.dc.html   -> /it-support-white-rock
    it-support-delta.dc.html        -> /it-support-delta

scripts/             Vanilla JS, loaded by every page
  support.js           Design Canvas runtime (renders <x-dc> documents). Generated —
                        don't hand-edit; re-export from Design Canvas instead.
  seynox-logo.js        <seynox-logo> custom element (WebGL mark, SVG fallback)

_ds/                 Design-system CSS/JS bundle (generated, don't hand-edit)
uploads/             Images referenced by pages
archive/             Unused draft pages + old exports, kept for reference only
.htaccess            Clean-URL rewrite rules (see below)
favicon.svg           Generated from the same shape math as scripts/seynox-logo.js
sitemap.xml, robots.txt
```

## Clean URLs — how they work

Every page file lives at a nested physical path (e.g.
`pages/locations/it-support-vancouver.dc.html`) but is served at a flat clean
URL (`/it-support-vancouver`). `.htaccess` does an internal rewrite (URL bar
never changes) mapping each slug to its real file.

Each page's `<head>` also has a matching, **flat** `<base href="/<slug>.dc.html">`
tag — e.g. `<base href="/it-support-vancouver.dc.html">` even though the real
file is nested. This doesn't need to point at a real file; it only needs to:

1. Keep every page's relative asset paths (`_ds/...`, component fetches)
   resolving against the site root, regardless of how deep the real file is
   nested.
2. Give `scripts/support.js` a filename-shaped last path segment to read, so it
   knows which component is the page's root (it infers this from the URL/base
   path — see `dcNameFromPath` in `scripts/support.js`).

If you add a page, you need three things in sync: the physical file, a
`.htaccess` rule for its slug, and the `<base href="/slug.dc.html">` tag in
its `<head>`. Copy an existing page in the same section as a template.

## Adding a new location page

1. Copy an existing file in `pages/locations/` as a starting point.
2. Update its `<base href>`, `<title>`, canonical/OG tags, and body copy.
3. Add its slug to the location alternation in `.htaccess`
   (`RewriteRule ^(it-support-(vancouver|...))/?$ ...`).
4. Add a nav link in `components/site-header.dc.html` (and footer, if listed
   there) and an entry in `sitemap.xml`.

## Components

Components are fetched client-side by name: `<dc-import name="site-header">`
in a page triggers a fetch of `/site-header.dc.html`, which `.htaccess`
rewrites to `components/site-header.dc.html`. Component names must stay in
sync with their filename (case-sensitive) in both the `dc-import` tag and the
`.htaccess` component rule.

## Domain

Site domain is `seynox.com`. Email addresses still use `@seynox.ca`
intentionally — that's a separate, unrelated business decision, not a bug.
