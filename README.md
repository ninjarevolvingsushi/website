# Ninja Revolving Sushi — Website Guide

This folder is your complete website. Everything you need to change is explained below in plain English. The only file you ever edit is **index.html** (open it in any text editor, like Notepad or VS Code).

---

## 1. Add your front video

1. Take your revolving-belt video (a horizontal video works best, 15–60 seconds, under ~30 MB so it loads fast on phones).
2. Rename the file to exactly: **belt.mp4**
3. Put it inside the **videos** folder.

That's it — the website finds it automatically, plays it muted on loop behind the big "SUSHI" title. Until the video exists, a placeholder photo shows instead.

Tip: if your video file is huge, compress it first at https://www.freeconvert.com/video-compressor (choose MP4, target ~20 MB).


## 2. Add your menu photos

Put your food photos inside the **images/menu** folder. Square photos look best (the site crops them into a circle on the plate). Each photo must be named exactly as listed below — lowercase, with dashes, ending in .jpg:

| Menu item | Photo file name |
|---|---|
| Chicken Teriyaki | images/menu/chicken-teriyaki.jpg |
| Salmon Teriyaki | images/menu/salmon-teriyaki.jpg |
| Chicken Katsu | images/menu/chicken-katsu.jpg |
| Tonkotsu Ramen | images/menu/tonkotsu-ramen.jpg |
| Beef Udon | images/menu/beef-udon.jpg |
| California Roll | images/menu/california-roll.jpg |
| Spicy Tuna Roll | images/menu/spicy-tuna-roll.jpg |
| Salmon Roll | images/menu/salmon-roll.jpg |
| Philadelphia Roll | images/menu/philadelphia-roll.jpg |
| Shrimp Tempura Roll | images/menu/shrimp-tempura-roll.jpg |
| Eel Avocado Roll | images/menu/eel-avocado-roll.jpg |
| Ninja Roll | images/menu/ninja-roll.jpg |
| Dragon Roll | images/menu/dragon-roll.jpg |
| Rainbow Roll | images/menu/rainbow-roll.jpg |
| Volcano Roll | images/menu/volcano-roll.jpg |
| Texas Roll | images/menu/texas-roll.jpg |
| Edamame | images/menu/edamame.jpg |
| Gyoza | images/menu/gyoza.jpg |
| Miso Soup | images/menu/miso-soup.jpg |
| Seaweed Salad | images/menu/seaweed-salad.jpg |
| Takoyaki | images/menu/takoyaki.jpg |
| Agedashi Tofu | images/menu/agedashi-tofu.jpg |
| Spicy Tuna Hand Roll | images/menu/spicy-tuna-hand-roll.jpg |
| Salmon Avocado Hand Roll | images/menu/salmon-avocado-hand-roll.jpg |
| California Hand Roll | images/menu/california-hand-roll.jpg |
| Eel Cucumber Hand Roll | images/menu/eel-cucumber-hand-roll.jpg |
| Salmon Nigiri | images/menu/salmon-nigiri.jpg |
| Tuna Nigiri | images/menu/tuna-nigiri.jpg |
| Yellowtail Nigiri | images/menu/yellowtail-nigiri.jpg |
| Ebi Shrimp Nigiri | images/menu/ebi-shrimp-nigiri.jpg |
| Tamago Nigiri | images/menu/tamago-nigiri.jpg |
| Unagi Nigiri | images/menu/unagi-nigiri.jpg |
| Salmon Sashimi | images/menu/salmon-sashimi.jpg |
| Tuna Sashimi | images/menu/tuna-sashimi.jpg |
| Yellowtail Sashimi | images/menu/yellowtail-sashimi.jpg |
| Octopus Sashimi | images/menu/octopus-sashimi.jpg |
| Mochi Ice Cream | images/menu/mochi-ice-cream.jpg |
| Tempura Cheesecake | images/menu/tempura-cheesecake.jpg |
| Green Tea Ice Cream | images/menu/green-tea-ice-cream.jpg |
| Dorayaki | images/menu/dorayaki.jpg |
| Steamed Rice | images/menu/steamed-rice.jpg |
| Sushi Rice | images/menu/sushi-rice.jpg |
| House Salad | images/menu/house-salad.jpg |
| Ginger & Wasabi | images/menu/ginger-wasabi.jpg |

Any photo you haven't added yet shows a placeholder automatically — nothing breaks.


## 3. Edit menu items, descriptions, prices, and plate colors

Open **index.html** and search for: `MENU DATA`

Each item is one line. Two kinds:

**Belt items** (priced by plate color — red $1.99, orange $2.99, green $3.99):
```
{n:"California Roll", d:"Crab, avocado, cucumber", plate:"red"},
```
Change `plate:` to `"red"`, `"orange"`, or `"green"` and the price and plate rim color update automatically. The price is not written under every item's plate name anymore — the rim color shows it, and the small legend near the menu title explains the colors.

**To add a new plate color** (for example blue at $4.99): search for `PLATES` in index.html and add one line:
```
blue: {color:"#2456A6", price:"$4.99"},
```
Then use `plate:"blue"` on any item. To change the existing prices ($1.99/$2.99/$3.99), edit them in the same `PLATES` list — the legend updates by itself.

**Any plate color works in any category** — an orange-plate item can go under Dessert, Entrée, anywhere. Just set `plate:"orange"` on that line.

**Moving the rows:** every row rolls left to right on its own. Visitors can also grab any row with the mouse (or finger on phones) and slide the items themselves, or use the ‹ › buttons at the right side of each row heading. Auto-rolling pauses while they interact and resumes by itself. To change the base rolling speed, search for `BELT_SPEED_BASE` in index.html: bigger number = faster (42 is the default).

**Photos:** every item currently shows a temporary placeholder. As soon as you put your own photo in `images/menu/` with the matching name (list above), it replaces the placeholder automatically inside the round plate. Square photos of the actual dish look best.

**Kitchen items** (their own price, shown on a gold plate):
```
{n:"Ninja Roll", d:"Spicy tuna, crunch, chef's secret sauce", price:"$12.95"},
```



## 4. Add your real Uber Eats / DoorDash / Grubhub links

The buttons now show the real Uber Eats, DoorDash, and Grubhub logos (they're built into the code — nothing to add; source copies are saved in images/brands if you ever need them).

Already done — the Uber Eats, DoorDash, and Grubhub buttons point to your real Ninja Sushi & Grill store pages in all 3 places (top menu dropdown, mobile menu, and the Order section). These links automatically open the app on phones, or the App Store / Google Play if the app isn't installed. If a store URL ever changes, search for "ubereats.com", "doordash.com", or "grubhub.com" in index.html and paste the new link.


## 5. Instagram and Facebook

Already done — the footer icons link to your real Instagram (@ninjasushigrill) and Facebook pages. To change them later, search for "instagram.com" or "facebook.com" in index.html.


## 6. The enquiry form (hiring, events, questions)

The form already sends every submission to **ninjasushigrill@gmail.com** using a free service called FormSubmit.

**One-time setup:** the first time someone submits the form on your live website, FormSubmit sends ONE confirmation email to your Gmail. Open it and click "Activate". After that, every enquiry arrives in your inbox automatically, formatted as a table. No account or password needed.


## 7. Put it live on Vercel with your domain

1. Go to **vercel.com** and sign up (free) — easiest with a GitHub account, but email works too.
2. Easiest way, no coding: install the "Vercel CLI"? Not needed — just go to **vercel.com/new**, and drag-and-drop this whole folder onto the page. Vercel deploys it and gives you a free link like `ninja-sushi.vercel.app` within a minute. (If drag-and-drop isn't offered, upload the folder to a free GitHub repository first, then import it in Vercel — Vercel shows you exactly how.)
3. Connect your domain: in your Vercel project go to **Settings → Domains**, type `ninjarevolvingsushiarlington.com`, and click Add.
4. Vercel will show you 1–2 DNS records to add (usually an **A record** pointing to Vercel's IP, and a **CNAME** for www). Log in to the website where you bought the domain (GoDaddy, Namecheap, etc.), open DNS settings, and add exactly what Vercel shows you.
5. Wait a few minutes (sometimes up to an hour). Your site is live at your domain, with free HTTPS automatically.

**To update the site later** (new menu, new photos, new video): change the files in this folder and deploy again the same way — drag-and-drop the folder at vercel.com/new, or push to GitHub if you set that up. Takes under a minute.


## Quick reference — what's where in index.html

## 8. Menu board (small cards on each disc)

You can place a small menu-card image that "sticks" to each disc (the little board that sits on the conveyor). Put images in `images/menu-cards/` named to match the menu slug (same slug used for `images/menu/<item>.jpg`). Example:

- `images/menu-cards/california-roll.png`
- `images/menu-cards/salmon-nigiri.png`

If a `menu-cards/<slug>.png` file exists the site shows it above the plate and it moves with the disc. If the file is missing the slot simply shows the plate photo — nothing breaks. This makes replacing or updating menu boards later as simple as dropping a PNG into `images/menu-cards/`.



---

## Add the Ninja logo onto your belt video

1. Put your source logo image (the one you attached) into `images/` and name it `logo.png` (or any name you like).
2. Run the helper to make the black background transparent (requires Python Pillow):

```
python tools/make_logo_transparent.py images/logo.png images/logo_alpha.png 30
```

3. Use `ffmpeg` to overlay the transparent logo twice (top-left and bottom-center) onto `videos/belt.mp4`:

```
tools\overlay_logo.bat videos\belt.mp4 images\logo_alpha.png output\belt_with_logo.mp4
```

Notes:
- `make_logo_transparent.py` turns near-black pixels (threshold 30) fully transparent — adjust the threshold if the logo has dark non-background details.
- `overlay_logo.bat` requires `ffmpeg` to be installed and on your PATH.
- The scripts save output to `output/belt_with_logo.mp4` by default. Change the paths if you prefer.

