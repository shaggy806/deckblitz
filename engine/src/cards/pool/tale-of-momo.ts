import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 10155.
//
// Rulings:
//   [2025-10-02] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions (such as that of
//     Tale of Momo's first ability). The mana value of the spell is determined by only its mana
//     cost, no matter what the total cost to cast that spell was.
// "Your library and/or graveyard" is Tower Winder's shape: a resolution-time
// `modal` over the three `search-library` `zones`, where only a search that
// includes the library shuffles. The reduction asks whether a creature you
// controlled as it left has left the battlefield this turn.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { type: "creature", subtype: "Ally" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Tale of Momo",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "This spell costs {2} less to cast if a creature left the battlefield under your control this turn.\n" +
    "Search your library and/or graveyard for an Ally creature card, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: [],
  selfCostReduction: {
    condition: { kind: "turn-history", what: "left", filter: { type: "creature" } },
    reduceGeneric: 2,
  },
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
});
