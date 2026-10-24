import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 22169.

export default defineCard({
  name: "Molten Vortex",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{R}, Discard a land card: This enchantment deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, Discard a land card: This enchantment deals 2 damage to any target.",
    },
  ],
});
