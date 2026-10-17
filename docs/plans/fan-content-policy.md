# Fan content: what the site discloses

Status: **shipped** (2026-10-16) — the notice, the art credits and the name; one question no
notice settles (a playable game).

The backlog asked (the user, 2026-10-11): what does deckblitz.net have to show to comply with
Wizards of the Coast's Fan Content Policy, and where? This records what the two sets of terms the
site leans on ask for, what the site now shows, and what is still open. It isn't legal advice:
it's a reading of the published terms.

## The terms

**Wizards' Fan Content Policy** (company.wizards.com/en/legal/fancontentpolicy, last updated
2017-11-15, read 2026-10-16):

- **The notice**, with the fan content: "[Title] is unofficial Fan Content permitted under the Fan
  Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of
  Wizards of the Coast. ©Wizards of the Coast LLC." It says to include it; it doesn't say where.
- **Free.** No payment, survey, download, subscription or email sign-up to reach the content, and
  nothing sold or licensed. Ads, donations and sponsors are allowed if access stays free (a
  sponsor credited briefly, never associated with Wizards).
- **No Wizards logos or trademarks** without written permission (ones already inside material
  reused unchanged may stay); **no removing legal notices** in Wizards' material.
- **Not:** Wizards IP "in other games", free or not; its "patents, game mechanics" (the FAQ);
  verbatim reposting of rules or proxies of cards.

**Scryfall's API terms** (scryfall.com/docs/api, "Use of Scryfall Data and Images", read
2026-10-16), which cover every card image and most card data here:

- Don't imply Scryfall's endorsement; don't paywall its data; don't use it to create new games;
  don't just repackage it.
- Card images: don't crop off the copyright or artist name, distort, **blur**, sharpen, recolour,
  watermark them, or present them as another game's.
- **"When using the art_crop, list the artist name and copyright elsewhere in the same interface
  presenting the art crop, or use the full card image elsewhere in the same interface."**
- API requests carry an accurate User-Agent and an Accept header — the browser's own in the page;
  every Node script in `engine/scripts/` already sends both.

## What the site shows now

- **The notice** — the policy's own words, from one module (`client/src/legal/notice.ts`) — as a
  quiet footer (`SiteNotice`) on the landing page, the library and the deck builder, linking the
  policy and an **About & legal** page (`/about`, `AboutPage`): the notice, that the game's names,
  text, symbols and art are Wizards', that card data and images come from Scryfall without its
  endorsement, and that the site is free with nothing for sale. Beside the notice, footer and
  About page both say "All card art and its licenses belong to Wizards of the Coast." (the user's
  call, to be safe). The game's Game menu links the page (in a new tab, so the game isn't left).
- **Art credits.** The board's tiles are art crops, so the full card displays (`CardTile` — the
  hover card, the stack, zone viewers) carry "Illus. {artist} · ™ & © Wizards of the Coast" along
  the foot of their art, on a dark fade (the user's call, over the text box's foot); the lobby's
  commander art carries the same in its hover title, and the landing page credits its hero art in
  the footer. The artist is looked up for the printing the art comes from (`ui/artistCredit.ts`:
  by name, card id, page or API link, as `resolveArtUrl` reads them), seeded free from the art's
  own batched lookup, batched and cached for two weeks like it. The library and deck builder show
  whole card images, which carry their own credit.
- **The name is "Deck Blitz"** (the user, 2026-10-16), no longer "MTG Deck Blitz": "MTG" stands for
  Magic: The Gathering, a Wizards trademark the policy says not to use without permission. As
  Scryfall ("Scryfall Magic: The Gathering Search") and Moxfield ("Moxfield - MTG Deck Builder") do,
  the brand carries no mark and the game is named only to say what the site is for — the page
  title "Deck Blitz · Magic: The Gathering Commander deck tester", the landing page's "A Commander
  deck tester for Magic: The Gathering" (`SITE_DESCRIPTOR`) — and a trademark line, Moxfield's
  kind, joins the notice: "Magic: The Gathering and its logos are trademarks of Wizards of the
  Coast LLC." (`TRADEMARK_LINE`).
- **The landing backdrop** (`client/public/menu-backdrop.webp`, a blurred grid of commander card
  images) stays as it is: its images weren't taken from Scryfall (the user, 2026-10-16), so
  Scryfall's "don't blur" doesn't reach it, and Wizards' policy doesn't forbid altering card images
  — only removing legal notices from them, which a dim decorative blur doesn't do the way cropping
  would, with the site-wide notice saying whose they are.

## Open

- **A playable game.** The site runs Magic itself: its rules, card text and art, in a game. The
  policy covers fan *content* — websites, videos, streams — and bars Wizards IP "in other games" and
  its "game mechanics"; it says nothing about a digital implementation of Magic as such, and
  Scryfall's terms bar using its data "to create new games". Other free Magic clients run without
  any written permission, at Wizards' tolerance. The notice and credits are what the policy asks of
  fan content; they don't make that question go away. A lawyer's question, if it matters.
