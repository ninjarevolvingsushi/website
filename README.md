# Ninja Revolving Sushi — Website

Live site: https://www.ninjarevolvingsushi.com

The whole website is one file: **`index.html`**. Photos live in `SUSHI/`, the hero video in `videos/`.

## How the site is put together

| Part | Where it lives |
|---|---|
| Domain name | GoDaddy (registration only — DNS is managed in Cloudflare) |
| Website code, photos, video | This GitHub repository |
| Hosting | Cloudflare Pages — every change pushed to `main` goes live automatically within a minute or two |
| Book a Table + "Get in Touch" form | Google Apps Script (script.google.com, ninjasushigrill@gmail.com) |
| Pickup, rewards sign-up, gift cards | Toast |
| Delivery | Uber Eats, DoorDash, Grubhub (links in `index.html`) |

**Safe way to make changes:** make them on a new branch and open a pull request. Cloudflare builds a preview link for the branch. Check it on your phone, then merge into `main` to go live.

## Common edits (open `index.html` and search for the words in CAPS)

### Menu items and prices — search `MENU DATA`
Each dish is one line:

```js
{n:"California Roll", price:"$2.99"},
```

### Menu photos
Photos are in `SUSHI/<category>/`. The site uses the small **`.webp`** copy of each photo (about 25 KB) — not the `.png` original (2–3 MB). When you add a new photo, add a `.webp` version with the same name next to it.

### Holiday hours — search `HOLIDAY HOURS`
Add one line per special day:

```js
{date:"2026-11-26", closed:true, note:"Thanksgiving"},
{date:"2026-12-24", open:"11:30", close:"18:00", note:"Christmas Eve"},
```

On that day the top of the page says "Closed today" or shows the special hours, and the footer lists any holiday hours in the next 3 weeks.

### Regular opening hours
These are in **two places**. Change both:
1. The `Hours` list in the footer (search `<h4>Hours</h4>`)
2. The line `const H={0:[720,1320],...` (minutes after midnight, 0 = Sunday)

### Delivery links — search `ubereats.com`, `doordash.com`, `grubhub.com`
### Instagram / Facebook — search `instagram.com`, `facebook.com`

## Booking and contact form
Both send to the Google Apps Script web app (search `script.google.com`). Booking shows the open time slots, holds the slot for a few minutes while the guest fills in their details, then confirms it. After confirming, guests can tap **Add to calendar**.
The contact form has a hidden anti-spam field (`website`). Real visitors never see it.

## Files
- `index.html` — the website
- `SUSHI/` — menu photos (`.webp` used on the site, `.png` originals kept for editing)
- `videos/hero-final-optimized.mp4` — the hero video
- `favicon.ico`, `images/favicon-32.png`, `images/apple-touch-icon.png` — browser tab and home-screen icons
- `robots.txt`, `sitemap.xml` — for search engines
- `tools/` — helper scripts used when making the logo/video
