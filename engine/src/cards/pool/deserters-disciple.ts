import { defineCard } from "../define.js";

// EDHREC rank 16874.
//
// Rulings:
//   [2025-11-21] Once a creature with power 2 or less has been blocked, Deserter's Disciple's
//     ability won't cause it to become unblocked.
//   [2025-11-21] If the target creature's power is increased to 3 or greater after Deserter's
//     Disciple's ability is activated but before it resolves, the ability doesn't resolve.
//     However, if instead the creature's power is increased to 3 or greater after the ability
//     resolves, it still can't be blocked that turn.
//
// Eardrum Rattler's ability without the {1}.
const TEXT = "{T}: Another target creature you control with power 2 or less can't be blocked this turn.";

export default defineCard({
  name: "Deserter's Disciple",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
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
