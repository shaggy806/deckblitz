import { defineCard } from "../define.js";

const GRANTED = "{T}: This creature deals 1 damage to any target.";
const TEXT = `Enchanted creature gets +2/+2 and has "${GRANTED}"`;

export default defineCard({
  name: "Arcane Teachings",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
