# OMART19 site

Portfolio and portal: the work (a co-op game, S.P.I.D.E.R., robot builds, 3D), tutorials, downloads,
problem reports and a hire form. Plain HTML, CSS and JavaScript. No frameworks, nothing third-party in the
pages except the Google Fonts (all OFL).

| Page | File |
|---|---|
| Home | `index.html` |
| Projects | `projects/spider.html`, `projects/dont-stop-walking.html`, `projects/robots.html`, `projects/3d.html` |
| How-to guides | Listed on the S.P.I.D.E.R. page (`projects/spider.html#how-to`); one page per guide in `tutorials/` (generated, see below). Not in the menu. |
| Downloads | `downloads.html` |
| Report a problem | `support.html` |
| Hire form | `hire.html` |

## Look at it
Double-click `index.html`. Every page works straight from the folder.
(The download box can only look up releases when the site is online.)

## The one settings file: `assets/config.js`
Paste a link between the quotes and that button switches on across the whole site. Leave it `""` and the
site shows "coming soon" instead.

| Setting | What it switches on |
|---|---|
| `patreon` | Patreon links (home, hire page, footer, game page) |
| `ebay` | eBay store button and banner on the robots page |
| `steamAppId` | "Wishlist on Steam" buttons (the number in the store page address) |
| `reportsRepo` | Where problem reports go (see *Problem reports*) |
| `downloads.spider` | The signed release file the download box reads (see *Downloads*) |
| `hireFormEndpoint` | The employer form (see *Hire form*) |
| `videos` | Video cards on the game, S.P.I.D.E.R. and robots pages. YouTube links get a thumbnail. |
| `parts.servoRig` | The robot parts list: a product link per part, or none. How-to: [PARTS-LIST.md](PARTS-LIST.md) |

## Downloads and S.P.I.D.E.R. updates
S.P.I.D.E.R.'s release tool (in the SPIDER repository, see its `docs/RELEASING.md`) builds the Windows and
Linux downloads and a signed `spider/latest.json`. The download box on this site and the update check inside
S.P.I.D.E.R. both read that one file, so publishing a release updates both. Per release:

1. In SPIDER: `version`, then `build` (it asks for your signing-key passphrase).
2. Here on GitHub: **Releases** > **Draft a new release**, tag `spider-v<version>`, attach the `.zip` and the
   `.tar.gz` the tool made, **Publish release**.
3. In SPIDER: `publish` copies `latest.json` and `latest.json.sig` into this site's `spider/` folder. Commit and push.

The download box shows the version, date, a button per system with its size, the release notes and each
file's SHA-256 for checking by hand. Until `spider/latest.json` exists it says "Not released yet".
The repository must be **public** for downloads and update checks to work. Only the archives are shared;
S.P.I.D.E.R.'s source stays private. (GitHub adds a "Source code" archive to every release: that is this
website's source, never S.P.I.D.E.R.'s.)

## Problem reports (GitHub Issues)
`support.html` links to five report forms in `.github/ISSUE_TEMPLATE/` (S.P.I.D.E.R., game, robot build,
website, idea). Reports land in the **Issues** tab of `reportsRepo`, and GitHub emails you about each one.
The repository must be public so people without access can report.

Flood protection, all automatic:
- Reporting needs a GitHub account, and only the forms can be used (blank reports are off).
- `.github/workflows/report-guard.yml` runs on every new report: more than 3 reports from one account in
  24 hours, or more than 5 open at once, and the extra report is closed with a polite note. Accounts under a
  week old get a `new-account` label. You and collaborators are never limited. It uses only GitHub's own
  tools (no third-party actions), and Actions are free on public repositories.
- If you are ever flooded: **Settings > Moderation options > Interaction limits** pauses reports from new
  or unknown accounts for 24 hours to 6 months, in one click.

One-time setup after the repository goes public: **Actions** tab > **Set up labels** > **Run workflow**.
It creates the labels the forms use (GitHub ignores labels that do not exist yet).

## Hire form
A static site cannot receive messages by itself, so the form sends them through a form service that emails
them to you. Formspree works out of the box (the form already has its spam trap field `_gotcha`):

1. Make a free account at formspree.io and create a form. It gives you an address like
   `https://formspree.io/f/abcdwxyz`.
2. Paste it into `hireFormEndpoint` in `assets/config.js`.

Until then the form says it is not switched on and sends nothing. Spam guards in the page: a hidden trap
field, a minimum time on the page, and one message per visitor every 15 minutes. The service filters spam too.
Messages stay private: they never touch the public repository.

## Tutorials
The tutorial pages are generated from S.P.I.D.E.R.'s Markdown tutorials, so there is one copy to keep up to
date. After changing a tutorial in `../SPIDER/docs/tutorials/`, run:

    python tools/build.py

It rewrites `tutorials/*.html`, copies the screenshots into `assets/tutorials/`, turns repo-only links into
plain text and leaves out the seller product photos (those are not ours to publish). It needs the `markdown`
package (BSD-3-Clause, permissive): `pip install markdown`. It runs on your PC only.

## Menu, footer and `<head>`
They are the same on every page. Edit them in `tools/build.py` (`HEAD`, `BAR`, `FOOT`) and run
`python tools/build.py --chrome`. Each page keeps its own `<title>`, description and content.

## Keep it private / make it live
Right now the repository is private and **GitHub Pages is off**, so nothing is online. Pages sites on personal
accounts are always public, so switch it on only when you want the world to see it:

1. In `tools/build.py` set `DRAFT = False` and run `python tools/build.py --chrome` (lets search engines list it).
2. Make the repository public (GitHub Free). Public is not open source: there is no licence file, so all
   rights stay yours. GitHub's terms do let other users view and fork it on GitHub.
3. **Settings > Pages > Build and deployment**: *Deploy from a branch*, branch `main`, folder `/ (root)`, **Save**.
4. After a minute the site is at `https://omart19.github.io/portfolio/`. For `https://omart19.github.io`,
   rename the repository to `omart19.github.io` and update the two links in `.github/ISSUE_TEMPLATE/config.yml`
   and `robot-build.yml`.
5. **Actions** > **Set up labels** > **Run workflow** (once).

© OMART19. All rights reserved. The text, images, video and code are not licensed for reuse.
