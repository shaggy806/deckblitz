import { defineCard } from "../define.js";

// EDHREC rank 13229. Wort, the Raidmother's conspire grant, over every
// noncreature spell: each instance is its own cost and copy (702.78b), and a
// copy of a noncreature permanent spell resolves into a token (707.10f).
//
// Rulings:
//   [2025-11-17] A resolving copy of a permanent spell becomes a token. That token isn't "created"
//     and won't interact with abilities that care about tokens being created.
//   [2025-11-17] If a spell has multiple instances of conspire (perhaps from multiple Raiding
//     Schemes), you may choose to pay for each of those abilities individually. Each conspire
//     ability triggers only if you tap two creatures specifically for that ability.
//   [2025-11-17] The copy is created on the stack, so it's not "cast."

const TEXT =
  "Each noncreature spell you cast has conspire. (As you cast a noncreature spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose new targets for the copy. A copy of a permanent spell becomes a token.)";

export default defineCard({
  name: "Raiding Schemes",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { notTypes: ["creature"] }, conspire: true },
      text: TEXT,
    },
  ],
});
