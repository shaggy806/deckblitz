import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 19569.

// "Your library and/or graveyard" is Tower Winder's shape: a resolution-time
// `modal` over the three `search-library` `zones`, where only a search that
// includes the library shuffles.
const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Chandra, Bold Pyromancer" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Chandra's Outburst",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Chandra's Outburst deals 4 damage to target player or planeswalker.\nSearch your library and/or graveyard for a card named Chandra, Bold Pyromancer, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
          { text: "Search your library", effect: search("library") },
          { text: "Search your graveyard", effect: search("graveyard") },
        ],
      },
    ],
  },
});
