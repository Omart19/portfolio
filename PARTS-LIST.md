# Parts lists: how to add parts and links

The **Parts list** on the Robots page (`projects/robots.html#parts`) is built from one place:
`assets/config.js`, under `parts`. You never edit the page itself. Change the list, save, commit and push, and the
site updates in about a minute.

## What one part looks like

Open `assets/config.js` and find `parts:`. Each part is one line between `{ }`:

```js
parts: {
  servoRig: [
    { part: "Micro servo", detail: "MG90S (metal gear) or SG90 (plastic gear), 4.8-6 V", qty: "1", url: "" },
    { part: "Breadboard", detail: "830-point full size", qty: "1", url: "https://www.amazon.com/dp/B0XXXXXXXX" },
  ]
}
```

| Field | Needed | What to put |
|---|---|---|
| `part` | yes | The part's name, as people would search for it: `"Micro servo"`. |
| `detail` | no | What exactly to buy: model, size, voltage, anything that matters. `""` for nothing. |
| `qty` | no | How many. Text, so `"4+"` works. Leave it out for 1. |
| `url` | no | A link to **that exact product's page**, starting with `https://`. `""` = no link. |
| `label` | no | The link's text. Leave it out and the site names the store (`Amazon ↗`, `eBay ↗`, `AliExpress ↗`, `Adafruit ↗` ...). |
| `affiliate` | no | `true` only if the link earns you money (see below). Leave it out otherwise. |

Rules of the file (it is JavaScript): text goes in `"double quotes"`, a comma after every `}` except the last
one can stay (it is allowed), and a `"` inside text must be written `\"`. Use the parts already there as a pattern.

## Links: which ones, or none at all

**No link is fine.** With `url: ""` the part shows a dash. If **no** part in a list has a link, the whole
"Where to get it" column disappears and the list is just parts and amounts. The page always says that every part
is a common hobby part sold by most electronics shops, so nobody is left wondering where to look.

When you do add a link, it should be:

- **The exact product you used and tested**, not a search page and not a whole shop. A search or a shop changes
  over time; the product page shows exactly what to buy.
- **From a store you would buy from yourself**: Amazon, eBay listings, AliExpress, Adafruit, SparkFun, DigiKey,
  Mouser, Pololu, Seeed Studio, Micro Center ...
- **A clean address**, with the tracking cut off. Links copied while you are signed in can carry codes tied to your
  account. Keep only the part that names the product:

  | Store | Copied link (example) | Keep |
  |---|---|---|
  | Amazon | `https://www.amazon.com/Breadboard-830-Point.../dp/B0XXXXXXXX/ref=sr_1_3?crid=...&keywords=...` | `https://www.amazon.com/dp/B0XXXXXXXX` |
  | eBay | `https://www.ebay.com/itm/123456789012?_trkparms=...&_trksid=...` | `https://www.ebay.com/itm/123456789012` |
  | AliExpress | `https://www.aliexpress.us/item/3256805123456789.html?spm=...&gatewayAdapt=...` | `https://www.aliexpress.us/item/3256805123456789.html` |
  | Others | anything after `?` is usually tracking | everything before the `?` |

  Then open the clean link in a private browser window to check that it still shows the right product.
- **Not a shortened link** (bit.ly, a.co, ebay.us ...): people cannot see where it goes. Use the full address.
- **`https://` only.** Anything else is ignored and the part shows without a link.

**One of your own eBay listings** is a fine link for a part when that listing is exactly that part (`url` set to the
listing, e.g. `https://www.ebay.com/itm/123456789012`). Do not point parts at your shop's front page: the list
links each part to where that part is, or to nothing.

## Affiliate links (only if you join a programme)

If a link earns you a commission (Amazon Associates, eBay Partner Network, AliExpress Portals ...), the law (the
FTC's endorsement rules in the US) says you must tell people. Mark it:

```js
{ part: "Breadboard", detail: "830-point full size", qty: "1", url: "https://www.amazon.com/dp/B0XXXXXXXX?tag=yourtag-20", affiliate: true },
```

The site then writes "(affiliate)" next to that link, marks the link as sponsored for search engines, and shows
this line under the list: *Links marked (affiliate) are affiliate links: I may earn a small commission if you buy
through them, at no extra cost to you.* For an affiliate link, keep the tracking part the programme gives you
(e.g. `?tag=...`); that is how it pays you.

**Amazon Associates** also requires its own sentence on the site: add
`As an Amazon Associate I earn from qualifying purchases.` to that note in `projects/robots.html` (search for
`data-parts-affiliate`).

## A parts list for another build

1. In `assets/config.js`, add a new list next to `servoRig`, with its own name (letters only, no spaces):

   ```js
   parts: {
     servoRig: [ ... ],
     hexapod: [
       { part: "Servo", detail: "MG90S", qty: "18", url: "" },
     ]
   }
   ```

2. In the page that shows it (for example `projects/robots.html`), copy the table of the servo rig, change
   `data-parts="servoRig"` to `data-parts="hexapod"`, and copy the affiliate line under it with
   `data-parts-affiliate="hexapod"`:

   ```html
   <div class="table-wrap">
     <table>
       <thead><tr><th>Part</th><th>Qty</th><th>Where to get it</th></tr></thead>
       <tbody data-parts="hexapod"></tbody>
     </table>
   </div>
   <p class="note gap-top" data-parts-affiliate="hexapod" hidden>Links marked (affiliate) are affiliate links: I may earn a small commission if you buy through them, at no extra cost to you.</p>
   ```

## Check it, then publish

1. See it on your PC first: in a terminal in this folder run `python -m http.server 8000`, then open
   `http://localhost:8000/projects/robots.html#parts`. Press Ctrl+C in the terminal to stop it.
2. Click each link once: right product, right store.
3. Commit and push:

   ```
   git add assets/config.js
   git commit -m "Parts list: <what changed>"
   git push
   ```

   This repository is set to commit as "Oscar" with your private GitHub address, so your full name and email stay
   off the public site.

The site is live about a minute after the push: https://omart19.github.io/portfolio/projects/robots.html#parts
