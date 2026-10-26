import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 25407. The granted ability is Martyr's
// Cause's prevention shield, on a target creature.

const GRANTED = "{T}: The next time a source of your choice would deal damage to target creature this turn, prevent that damage.";

export default defineCard({
  name: "Samite Blessing",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
