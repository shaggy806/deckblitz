import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 27758.
//
// Rulings:
//   [2004-10-04] The ability can be activated during your opponent's upkeep as well as your own.
//     The upkeep restriction is there to avoid its use during combat.

const TEXT = "{2}, Sacrifice a land: Put a +2/+2 counter on target creature. Activate only during any upkeep step.";

export default defineCard({
  name: "Dwarven Armory",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+2/+2", amount: 1 },
      condition: { kind: "turn-structure", steps: ["upkeep"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
