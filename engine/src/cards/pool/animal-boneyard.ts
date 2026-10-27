import { defineCard } from "../define.js";

// The granted ability is the land's own, so its controller (not the Aura's)
// activates it, sacrifices one of their creatures and gains the life.
const GRANTED = "{T}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.";

export default defineCard({
  name: "Animal Boneyard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nEnchanted land has "${GRANTED}"`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
          targets: [],
          effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted land has "${GRANTED}"`,
    },
  ],
});
