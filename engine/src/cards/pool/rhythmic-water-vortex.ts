import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 30192. The bounce is two optional slots; the "and/or" search
// is The First Doctor's three modes, a library search shuffling.
const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Mu Yanling" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Rhythmic Water Vortex",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target creatures to their owner's hand.\nSearch your library and/or graveyard for a card named Mu Yanling, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
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
