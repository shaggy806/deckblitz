import { defineCard } from "../define.js";

// EDHREC rank 29134.
//
// Rulings:
//   [2019-06-14] Zhalfirin Decoy's ability can be activated even if a creature entered the
//     battlefield under your control only before Zhalfirin Decoy entered the battlefield, and even
//     if that creature has left the battlefield.
//
// "A creature" includes the Decoy itself (no "another").

export default defineCard({
  name: "Zhalfirin Decoy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  text: "{T}: Tap target creature. Activate only if you had a creature enter the battlefield under your control this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "creature" }, atLeast: 1 },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target creature. Activate only if you had a creature enter the battlefield under your control this turn.",
    },
  ],
});
