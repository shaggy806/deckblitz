import { defineCard } from "../define.js";

const GRANTED = "{T}: This creature deals 1 damage to any target.";
const TEXT = `Enchanted creature has "${GRANTED}"`;
const SAC = "Sacrifice this Aura: It deals 1 damage to any target.";

export default defineCard({
  name: "Fire Whip",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${TEXT}\n${SAC}`,
  targets: ["creature-you-control"],
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
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: SAC,
    },
  ],
});
