import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 19254.
//
// The damage is Ashling's Command's shape beside a plain `damage` to the
// player; the search is Tower Winder's — a resolution-time `modal` over the
// three `search-library` `zones`, where only a search that includes the
// library shuffles. The player is the only target (the ruling): a hexproof
// creature is still dealt damage.
//
// Rulings:
//   [2019-07-12] If the target player is an illegal target by the time Chandra's Flame Wave
//     resolves, the spell doesn't resolve. No creatures or players are dealt damage, and you won't
//     search for Chandra, Flame's Fury.
//   [2019-07-12] Chandra's Flame Wave targets the player, not their creatures. A creature with
//     hexproof may be dealt damage this way.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Chandra, Flame's Fury" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Chandra's Flame Wave",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Chandra's Flame Wave deals 2 damage to target player and each creature that player controls. Search your library and/or graveyard for a card named Chandra, Flame's Fury, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: 2, controlledByTarget: 0 },
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
