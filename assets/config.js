/* ===========================================================================
   OMART19 SITE SETTINGS - the one file to edit.

   Paste a link between the quotes and the site switches that button on by
   itself. Leave it "" and the site shows "coming soon" instead. No other file
   needs to change. Save, commit, push: GitHub Pages updates in about a minute.
   =========================================================================== */
window.SITE = {

  // Your GitHub account name.
  github: "Omart19",

  // Your Patreon page
  patreon: "https://www.patreon.com/Ergy",

  // Your eBay tech shop (robot parts)
  ebay: "https://www.ebay.com/usr/ergyslabtechshop",

  // Socials (footer, home contact panel, video sections). "" hides that link.
  youtube: "https://www.youtube.com/@ERGYVlogs",
  instagram: "https://www.instagram.com/ergyz19/",
  tiktok: "https://www.tiktok.com/@ergys_vlogs",

  // Don't Stop Walking on Steam: the number in the store page address
  // (store.steampowered.com/app/1234560/...), e.g. "1234560"
  steamAppId: "",

  // Problem reports go to the Issues tab of this repository. It must be PUBLIC
  // so people without access can report. See README > "Problem reports".
  reportsRepo: "Omart19/portfolio",

  // Downloads: the signed release information S.P.I.D.E.R.'s release tool publishes
  // ("publish" step, see SPIDER's docs/RELEASING.md). The download box and the
  // program's own update check both read it; the archives are GitHub release files.
  downloads: {
    spider: {
      manifest: "spider/latest.json",
      // every published version, newest first (the release tool keeps it): the "Older versions" list
      history: "spider/releases.json",
      // where all the release files live
      releasesPage: "https://github.com/Omart19/portfolio/releases"
    }
  },

  // Employer form: the address of a form service that emails you the message.
  // Formspree example: "https://formspree.io/f/abcdwxyz". Empty = the form shows as offline.
  hireFormEndpoint: "",

  // Video links: YouTube or any other site. One { title, url } per video.
  // e.g. { title: "Gameplay trailer", url: "https://www.youtube.com/watch?v=XXXXXXXXXXX" }
  videos: {
    dontStopWalking: [],
    spider: [],
    robots: []
  },

  // Robot parts lists (Robots page). How to add parts and links: PARTS-LIST.md.
  //   part, detail, qty: what it is. url: that exact product's page (https://...), or "" for no link.
  //   label: optional link text (default: the store's name). affiliate: true if the link earns you money.
  parts: {
    servoRig: [
      { part: "ESP32-S3 dev board", detail: "YD-ESP32-S3 N8R2 or any ESP32-S3-WROOM-1 board, USB-C", qty: "1", url: "" },
      { part: "Micro servo", detail: "MG90S (metal gear) or SG90 (plastic gear), 4.8-6 V", qty: "1", url: "" },
      { part: "Breadboard power module", detail: "MB102 type, set to 5 V", qty: "1", url: "" },
      { part: "DC power adapter", detail: "6.5-12 V, 1 A or more, barrel plug for the power module", qty: "1", url: "" },
      { part: "Breadboard", detail: "830-point full size", qty: "1", url: "" },
      { part: "Jumper wires", detail: "Male to male, 10 cm and 20 cm", qty: "4+", url: "" },
      { part: "USB-C data cable", detail: "Must carry data, not only charge", qty: "1", url: "" },
      { part: "Soldering iron and solder", detail: "To solder the board's pin headers (they ship loose)", qty: "1", url: "" }
    ]
  }
};
