import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 28048.
//
// Liliana's Scorn's shape: the optional library-and/or-graveyard search.
//
// Rulings:
//   [2017-02-09] If the target creature becomes an illegal target for Tezzeret's Betrayal, the
//     spell won't resolve and none of its effects will happen. You won't search for Tezzeret,
//     Master of Metal.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Tezzeret, Master of Metal" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Tezzeret's Betrayal",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Destroy target creature. You may search your library and/or graveyard for a card named Tezzeret, Master of Metal, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Tezzeret, Master of Metal?",
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
    ],
  },
});
