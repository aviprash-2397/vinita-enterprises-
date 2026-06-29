# Vinita Enterprises — Setup & Installation Guide

## What you have

A complete Progressive Web App (PWA) for wholesale order management. Once deployed, your salesmen install it from their browser and it behaves like a native Android/iPhone app — own icon, fullscreen, works offline.

## Files

| File | What it does |
|---|---|
| `index.html` | The whole app |
| `manifest.webmanifest` | Tells the phone "I'm an installable app" |
| `sw.js` | Service worker — offline support + caching |
| `icon.svg`, `icon-192.png`, `icon-512.png` | App icons (home screen, splash) |
| `database-update.sql` | One-time SQL to run in Supabase |

## STEP 1 — Update your database (one-time, takes 30 seconds)

1. Go to your Supabase dashboard → **SQL Editor** → **New query**
2. Open `database-update.sql` in any text editor, copy the whole thing
3. Paste it in the SQL editor → click **Run**
4. You should see "Success. No rows returned." That's it.

This adds: `retailers.credit_limit`, `retailers.outstanding`, `products.scheme_buy`, `products.scheme_free`, `salesmen.password_hash`, plus helpful indexes.

## STEP 2 — Deploy the app (Netlify, free, takes 2 minutes)

1. Go to **https://app.netlify.com/drop**
2. Select all 6 files (`index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`) — or drag the whole folder
3. Drop them on the page
4. Netlify gives you a URL like `https://something-random.netlify.app`
5. Done. That's your app URL. Share it with your salesmen.

**You can rename the URL:** Netlify dashboard → Site settings → Change site name → make it `vinita-enterprises` so the URL becomes `https://vinita-enterprises.netlify.app`.

## STEP 3 — Install on phones (the actual "app on phone" part)

**For your salesmen (Android):**
1. Open the Netlify URL in Chrome
2. Tap menu (⋮) → "Install app" *(or wait for the orange "Install" banner inside the app)*
3. App icon appears on home screen
4. From now on, they tap the icon like any other app. Opens fullscreen. No browser bar.

**For iPhone users (Safari):**
1. Open the URL in Safari (must be Safari, not Chrome on iPhone)
2. Tap the Share button → "Add to Home Screen"
3. Same result — icon, fullscreen

## What's new vs the old version

### Salesman side
- **Reorder button** on every past order — repeats the whole cart in one tap
- **Last sold rate badge** — every product shows the rate this retailer paid last time
- **Schemes auto-applied** — set "Buy 10 Get 1" on a product, system fills bonus quantity automatically
- **Category filter chips** at the top of the product list
- **Credit limit warning** — orange/red dot on retailer name, full warning bar if over limit
- **Offline cart** — cart survives if the phone loses internet
- **Outstanding balance** shown under each retailer's name

### Admin side
- **Full edit/delete** for: salesmen, companies, products, retailers
- **Order status workflow**: Placed → Confirmed → Dispatched → Delivered (tap an order in the list to advance)
- **Cancel order** option
- **Search bar** in admin orders (by order #, retailer name, salesman name)
- **Export to Excel** — exports the currently filtered orders as `.xlsx` with two sheets (Orders + Line Items)
- **Salesman leaderboard** in Reports — shows orders + revenue per salesman
- **Schemes & credit limit** fields in Add/Edit forms

### PWA features
- Installs to home screen (own icon, fullscreen, splash screen)
- Works offline — last-seen data still loads, cart persists
- "📵 Offline" banner shows when disconnected
- Service worker caches everything for fast loads

## Daily admin workflow

1. **Adding stock:** Manage → 🏭 Companies → + Add → enter name → save. Then Manage → 📦 Products → + Add → fill form including scheme (e.g. Buy 10, Get Free 1).
2. **Adding retailers with credit:** Manage → 🏪 Retailers → + Add → enter shop, contact, area, **credit limit ₹50,000**, current outstanding.
3. **Bulk-load 100s of products:** Manage → 📊 Bulk Upload via Excel → download template → fill in Excel → upload. Companies auto-create if they don't exist.
4. **Daily order processing:** Orders tab → tap an order → see all details → tap "Mark Confirmed" / "Mark Dispatched" / "Mark Delivered" as you go.
5. **End of day:** Filter "All" → Export to Excel → keep for your records.

## Daily salesman workflow

1. Open the app icon on home screen
2. Pick your name and enter the password given by admin
3. Pick a retailer (or + Add New Retailer if it's a new shop)
4. Pick a company → add products with + and − buttons
5. Tap 🏭 Companies at bottom → pick another company → add more products
6. When done, tap 🛒 Cart at bottom → review → pick payment terms → **Place Order**
7. WhatsApp opens automatically with the order ready to send to 9973478456

## Settings to change before going live

In `index.html`, near the top of the `<script>` section, change:

```js
const ADMIN_PW='admin123';                    // ← change this!
const WA_NUM='919973478456';                  // ← change if you change your number
```

Then re-upload to Netlify (just drag the new `index.html` onto the same site).

## Troubleshooting

**"The app shows old data after I made changes"**
The service worker caches things aggressively for offline mode. Tell users to pull-down-to-refresh, or in Chrome: ⋮ → Settings → Site settings → search vinita → clear & reset.

**"Salesman can't install on iPhone"**
Must use Safari, not Chrome. Apple restriction, nothing we can do.

**"DataCloneError postMessage Headers"**
You're previewing inside an iframe (Claude artifact, online HTML viewer). Open the deployed Netlify URL directly. It's harmless either way.

**"I want to make it a real .apk file"**
Once you've deployed on Netlify, you can wrap it with PWABuilder (https://www.pwabuilder.com): enter your URL, click "Android", download the APK, WhatsApp it to your salesmen. Takes 5 minutes.

## Cost

- Netlify hosting: **₹0/month forever** (free tier)
- Supabase database: **₹0/month** until you hit 500MB or 50k monthly users (won't happen)
- Total monthly cost: **₹0**

You only pay if you want a custom domain like `vinita-enterprises.in` — about ₹600/year from Hostinger or GoDaddy.
