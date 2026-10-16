import { defineCard } from "../define.js";

// EDHREC rank 18942.
//
// Rulings:
//   [2024-04-12] If one of the two other target creatures leaves the battlefield before Betrayal
//     at the Vault resolves, the creature you control will still deal damage to the remaining
//     other target creature.
//   [2024-04-12] If the creature you control leaves the battlefield before Betrayal at the Vault
//     resolves, Betrayal at the Vault has no effect and no damage is dealt.

// "Two other target creatures": distinct from the creature dealing the
// damage and from each other (one instance of "target" — rule 601.2c). Its
// power is read as it resolves and both are dealt damage at once. If the
// creature you control has left by then, no damage is dealt at all; if one
// of the other two has, the remaining one is still dealt damage (the
// rulings — rule 608.2b).
export default defineCard({
  name: "Betrayal at the Vault",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to each of two other target creatures.",
  targets: [
    "creature-you-control",
    { kind: "other", of: "creature", than: { slot: 0 } },
    { kind: "other", of: "creature", than: { slots: [0, 1] } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", target: 1, amount: { powerOf: 0 }, from: { target: 0 } },
      { kind: "damage", target: 2, amount: { powerOf: 0 }, from: { target: 0 } },
    ],
  },
});
