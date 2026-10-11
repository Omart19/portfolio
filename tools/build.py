"""Build the OMART19 site in place.

    python tools/build.py              # refresh header/footer on every page + rebuild the tutorials
    python tools/build.py --chrome     # only refresh header/footer (no SPIDER folder needed)

What it does
  1. Every .html page has marker comments: <!-- chrome:head -->, <!-- chrome:bar -->, <!-- chrome:foot -->.
     The blocks between them are rewritten from the templates below, so the menu, footer and <head> links
     are the same everywhere. Edit them HERE, then run this script.
  2. Turns S.P.I.D.E.R.'s Markdown tutorials (../SPIDER/docs/tutorials) into tutorials/*.html and copies their
     screenshots into assets/tutorials/. Repo-only links become plain text and seller photos are left out.
     The guides are only reached from the S.P.I.D.E.R. page (projects/spider.html#how-to), never from the menu.

Needs Python 3 and, for step 2 only, the "markdown" package (BSD-3-Clause, permissive: pip install markdown).
It runs on your PC only; nothing from it ships with the site.
"""
import argparse
import html
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# True while the site is a private draft: tells search engines not to list it. Set False when you go live.
DRAFT = False

HEAD = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{robots}<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{root}assets/site.css">"""

BAR = """<header class="bar">
  <div class="wrap">
    <a class="brand" href="{root}index.html" aria-label="Oscar: home">
      <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 2h24l6 6v24l-6 6H8l-6-6V8z" fill="none" stroke="#ff1f3d" stroke-width="2.5"/><path d="M13 12h14v16H13z" fill="none" stroke="#f0ebf1" stroke-width="2.5"/><path d="M27 12 13 28" stroke="#ff1f3d" stroke-width="2.5"/></svg>
      <b>OSCAR</b>
    </a>
    <nav class="nav" aria-label="Site">
      <a href="{root}index.html#work" data-nav="work">Work</a>
      <a href="{root}downloads.html" data-nav="downloads">Downloads</a>
      <a href="{root}support.html" data-nav="support">Support</a>
      <a href="{root}hire.html" data-nav="hire">Hire me</a>
    </nav>
    <div class="status" aria-label="Status">
      <span class="led">Building</span>
      <span class="clock-wrap">LOCAL <span data-clock>--:--:--</span></span>
    </div>
  </div>
</header>"""

FOOT = """<footer class="foot wrap">
  <nav aria-label="Footer">
    <a href="{root}index.html#work">Work</a>
    <a href="{root}projects/spider.html">S.P.I.D.E.R.</a>
    <a href="{root}projects/dont-stop-walking.html">Don't Stop Walking</a>
    <a href="{root}projects/robots.html">Robots</a>
    <a href="{root}projects/3d.html">3D</a>
    <a href="{root}downloads.html">Downloads</a>
    <a href="{root}support.html">Report a problem</a>
    <a href="{root}hire.html">Hire me</a>
    <a class="pending" data-link="patreon">Patreon</a>
    <a class="pending" data-link="youtube">YouTube</a>
    <a class="pending" data-link="instagram">Instagram</a>
    <a class="pending" data-link="tiktok">TikTok</a>
    <a data-link="github" href="https://github.com/Omart19">GitHub</a>
    <a href="{root}privacy.html">Privacy</a>
    <a class="pending" data-link="ebay">eBay shop</a>
  </nav>
  <div class="legal">
    <span>© <span data-year>2026</span> OMART19 · all rights reserved</span>
    <span>Designed and built by hand</span>
  </div>
</footer>

<dialog id="viewer" aria-label="Screenshot">
  <img id="viewer-img" alt="">
  <p id="viewer-cap"></p>
</dialog>
<script src="{root}assets/config.js"></script>
<script src="{root}assets/site.js"></script>"""

CHROME = {"head": HEAD, "bar": BAR, "foot": FOOT}

# S.P.I.D.E.R. tutorials published on the site.
TUTORIALS = [
    {
        "slug": "esp32-s3-servo-ble",
        "short": "ESP32-S3 servo over Bluetooth",
        "eyebrow": "Tutorial · S.P.I.D.E.R. · Hardware",
        "lead": "Take a blank ESP32-S3 board to a robot that connects to S.P.I.D.E.R. over your PC's own Bluetooth by itself, then move a servo from the dashboard and watch its live 3D twin.",
        "facts": ["About 10 minutes", "ESP32-S3 + MG90S / SG90", "Windows", "Tested on real hardware"],
        "card": "13-robot-panel-sweep.png",
        "drop": ["15. Re-run the whole tutorial automatically", "Licences"],
    },
    {
        "slug": "control-deck-and-controllers",
        "img": "control-deck",
        "short": "Control Deck and controllers",
        "eyebrow": "Tutorial · S.P.I.D.E.R. · Controls",
        "lead": "Put sliders, buttons and a joystick on screen for any robot, map a game controller or an ESP32 controller to them, and script the deck in Python, C# or C++.",
        "facts": ["About 15 minutes", "Gamepad or ESP32 controller", "Python · C# · C++"],
        "card": "08-stick-drives-servo.png",
        "drop": ["Licences"],
    },
    {
        "slug": "import-3d-models",
        "short": "Import your own 3D models",
        "eyebrow": "Tutorial · S.P.I.D.E.R. · 3D",
        "lead": "Rig a model in Blender so its moving parts move, export it at real size, and give it to your robot: the live 3D twin then moves the way the real robot does.",
        "facts": ["About 20 minutes", "Blender + any robot", "Virtual servo works too"],
        "card": "03-robot-screen-own-model.png",
        "drop": ["For S.P.I.D.E.R.'s built-in models (owner only)", "Licences"],
    },
    {
        "slug": "robot-dog-leg",
        "short": "Robot dog leg: model to board",
        "eyebrow": "Tutorial · S.P.I.D.E.R. · Hardware + 3D",
        "lead": "Export a two-servo robot leg from Blender and give it to S.P.I.D.E.R., so its 3D twin bends where the real leg bends. Then flash an ESP32-S3 with the leg's code and drive it over your PC's own Bluetooth.",
        "facts": ["About 30 minutes", "ESP32-S3 + 2 × MG90S", "Blender", "Tested on real hardware"],
        "card": "15-robot-screen-pose.png",
        "drop": ["14. Re-run this tutorial automatically", "The built-in model (owner only)"],
    },
]

PAGE = """<!doctype html>
<html lang="en">
<head>
<!-- chrome:head --><!-- /chrome:head -->
<title>{title} · OMART19</title>
<meta name="description" content="{lead}">
</head>
<body data-page="work">

<!-- chrome:bar --><!-- /chrome:bar -->

<main class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html">OMART19</a><span aria-hidden="true">/</span><a href="../projects/spider.html">S.P.I.D.E.R.</a><span aria-hidden="true">/</span><a href="../projects/spider.html#how-to">How-to</a><span aria-hidden="true">/</span><span>{short}</span></nav>

  <header class="page-hero solo">
    <div>
      <p class="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p class="lead">{lead}</p>
      <div class="facts">{facts}</div>
      <div class="cta">
        <a class="btn primary" href="../downloads.html">Get S.P.I.D.E.R.</a>
        <a class="btn pending" data-report="robot-build.yml" data-off="Help requests open soon" data-on="Stuck? Ask for help"><span data-label>Help requests open soon</span></a>
      </div>
    </div>
  </header>

  <div class="doc">
    <details class="toc" open>
      <summary>On this page</summary>
      <ol>
{toc}
      </ol>
    </details>
    <article class="prose">
<!-- Generated by tools/build.py from S.P.I.D.E.R.'s docs/tutorials/{slug}.md. Edit the Markdown there, then rebuild. -->
{body}
    </article>
  </div>
</main>

<!-- chrome:foot --><!-- /chrome:foot -->
</body>
</html>
"""


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if rel.parts[0] in ("tools", ".git", "node_modules"):
            continue
        yield p, rel


def render_chrome(name, rel, page):
    root = "../" * (len(rel.parts) - 1)
    robots = '<meta name="robots" content="noindex, nofollow">\n' if DRAFT else ""
    out = CHROME[name].format(root=root, robots=robots)
    if page:
        out = out.replace(f'data-nav="{page}"', f'data-nav="{page}" aria-current="page"')
    return out


def sync_chrome():
    marker = re.compile(r"<!-- chrome:(\w+) -->.*?<!-- /chrome:\1 -->", re.S)
    for path, rel in pages():
        text = path.read_text(encoding="utf-8")
        m = re.search(r'<body[^>]*data-page="([\w-]+)"', text)
        page = m.group(1) if m else ""
        new = marker.sub(lambda mm: f"<!-- chrome:{mm.group(1)} -->\n{render_chrome(mm.group(1), rel, page)}\n<!-- /chrome:{mm.group(1)} -->", text)
        if new != text:
            path.write_text(new, encoding="utf-8", newline="\n")
            print("chrome  ", rel.as_posix())


def drop_section(text, heading):
    pattern = re.compile(r"^## " + re.escape(heading) + r"\n.*?(?=^## |\Z)", re.S | re.M)
    return pattern.sub("", text)


def build_tutorials(spider):
    try:
        import markdown
    except ImportError:
        sys.exit("The tutorials need the 'markdown' package (BSD-3-Clause): pip install markdown")
    src_dir = spider / "docs" / "tutorials"
    if not src_dir.is_dir():
        sys.exit(f"S.P.I.D.E.R. tutorials not found in {src_dir}. Pass --spider PATH, or use --chrome.")
    out_dir = ROOT / "tutorials"
    out_dir.mkdir(exist_ok=True)

    for t in TUTORIALS:
        slug = t["slug"]
        img = t.get("img", slug)                  # screenshot folder under docs/tutorials/img/
        text = (src_dir / f"{slug}.md").read_text(encoding="utf-8").replace("\r\n", "\n")
        first, _, text = text.partition("\n")
        title = first.lstrip("# ").strip()

        # Things that only make sense inside the private repo
        text = re.sub(r"\*\*Contents\*\*\n.*?\n---\n", "", text, flags=re.S)
        text = re.sub(r"^(IP addresses, MAC.*|The whole run.*)\n", "", text, flags=re.M)
        for h in t["drop"]:
            text = drop_section(text, h)
        text = re.sub(r"\s*See \[Licences\]\(#licences\)\.", "", text)       # points at a dropped section
        # Seller product photos (not ours to publish): keep the text of those table rows as a list
        text = re.sub(r"^\| \| \|\n\|---\|---\|\n", "\n", text, flags=re.M)
        text = re.sub(r'^\| <img src="\.\./images/hardware/[^"]+\.jpg"[^>]*> \| (.+) \|$', r"- \1", text, flags=re.M)

        copies = set()

        def asset(m):
            alt_or_text, target = m.group(2), m.group(3)
            bang = m.group(1)
            path, _, anchor = target.partition("#")
            if path.endswith(".md") and "/" not in path:                      # another tutorial
                return f"{bang}[{alt_or_text}]({path[:-3]}.html{'#' + anchor if anchor else ''})"
            for prefix, dest in ((f"img/{img}/", f"{slug}/"), ("../images/hardware/", "hardware/")):
                if path.startswith(prefix) and not path.endswith(".jpg"):
                    name = path[len(prefix):]
                    copies.add((src_dir / path, ROOT / "assets" / "tutorials" / dest / name))
                    return f"{bang}[{alt_or_text}](../assets/tutorials/{dest}{name})"
            if path.startswith("../") or path.endswith(".md"):               # repo files: plain text
                return alt_or_text if not bang else ""
            return m.group(0)

        text = re.sub(r"(!?)\[([^\]]*)\]\(([^)\s]+)\)", asset, text)

        md = markdown.Markdown(extensions=["tables", "fenced_code", "toc", "sane_lists"],
                               extension_configs={"toc": {"toc_depth": "2-3"}})
        body = md.convert(text)
        body = body.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")
        body = body.replace("<img ", '<img loading="lazy" ')
        toc = "\n".join(
            f'        <li><a href="#{tok["id"]}">{html.escape(html.unescape(tok["name"]))}</a></li>'
            for tok in md.toc_tokens)

        page = PAGE.format(
            title=html.escape(title), short=html.escape(t["short"]), eyebrow=html.escape(t["eyebrow"]),
            lead=html.escape(t["lead"]), slug=slug, toc=toc, body=body,
            facts="".join(f'<span class="chip">{html.escape(f)}</span>' for f in t["facts"]))
        (out_dir / f"{slug}.html").write_text(page, encoding="utf-8", newline="\n")
        for src, dst in sorted(copies):
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
        card = src_dir / "img" / img / t["card"]
        if card.exists():
            dst = ROOT / "assets" / "tutorials" / slug / t["card"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(card, dst)
        print("tutorial", f"tutorials/{slug}.html", f"({len(copies)} images)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--chrome", action="store_true", help="only refresh header/footer")
    ap.add_argument("--spider", default=str(ROOT.parent / "SPIDER"), help="S.P.I.D.E.R. repo folder (default ../SPIDER)")
    args = ap.parse_args()
    if not args.chrome:
        build_tutorials(Path(args.spider))
    sync_chrome()


if __name__ == "__main__":
    main()
