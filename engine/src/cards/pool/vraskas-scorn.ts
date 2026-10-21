import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 24755. Rivals of Ixalan.
//
// Vraska's Stoneglare's optional library-and/or-graveyard search for the
// named planeswalker.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Vraska, Scheming Gorgon" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Vraska's Scorn",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent loses 4 life. You may search your library and/or graveyard for a card named Vraska, Scheming Gorgon, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 4, target: 0 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Vraska, Scheming Gorgon?",
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
