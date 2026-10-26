import { defineCard } from "../define.js";

// Rulings:
//   [2018-12-07] If an effect instructs you to draw cards and then discard cards, you can't take
//     actions in between.

const TEXT = "Discard a land card: This enchantment deals 2 damage to any target.";

export default defineCard({
  name: "Seismic Assault",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
