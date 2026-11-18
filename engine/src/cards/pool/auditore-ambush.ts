import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 15298.
//
// The target player does the searching (`as-player`), so which of their own
// zones they search is theirs to choose, as Tower Winder's controller chooses
// for itself: a resolution-time `modal` over the three `search-library`
// `zones`, where only a search that includes their library shuffles it.
const BOUNCE_TEXT = "Return target creature to its owner's hand.";
const SEARCH_TEXT =
  "Target player searches their library and/or graveyard for a card named Ezio, Blade of Vengeance, reveals it, and puts it into their hand. If they search their library this way, they shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Ezio, Blade of Vengeance" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Auditore Ambush",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: `Choose one or both —\n• ${BOUNCE_TEXT}\n• ${SEARCH_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      { text: BOUNCE_TEXT, targets: ["creature"], effect: { kind: "return-to-hand", target: 0 } },
      {
        text: SEARCH_TEXT,
        targets: ["player"],
        effect: {
          kind: "as-player",
          who: { target: 0 },
          effect: {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
              { text: "Search your library", effect: search("library") },
              { text: "Search your graveyard", effect: search("graveyard") },
            ],
          },
        },
      },
    ],
  },
});
