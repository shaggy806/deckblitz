import { defineCard } from "../define.js";

const TEXT = "Whenever enchanted creature attacks, it deals 2 damage to any target.";

export default defineCard({
  name: "Extra Arms",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      // "It" — the enchanted creature deals the damage, not the Aura.
      trigger: { on: "attacks", who: "attached" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0, from: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
