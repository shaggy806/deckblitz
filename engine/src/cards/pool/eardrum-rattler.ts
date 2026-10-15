import { defineCard } from "../define.js";

// EDHREC rank 30760.
//
// Rulings:
//   [2026-08-21] If the target creature's power changes to be greater than 2 before Eardrum
//     Rattler's ability resolves, the ability does nothing because the target is no longer legal.
//     However, once the ability has resolved, that creature won't be able to be blocked even if its
//     power increases above 2.
const TEXT = "{1}, {T}: Another target creature you control with power 2 or less can't be blocked this turn.";

export default defineCard({
  name: "Eardrum Rattler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { type: "creature", power: { op: "lte", n: 2 } } },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
