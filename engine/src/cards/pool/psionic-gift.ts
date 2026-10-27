import { defineCard } from "../define.js";

const GRANTED = "{T}: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Psionic Gift",
  manaCost: "{1}{U}",
  colors: ["U"],
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
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
