import { defineCard } from "../define.js";

export default defineCard({
  name: "Raking Canopy",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a creature with flying attacks you, this enchantment deals 4 damage to it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { keyword: "flying" }, attackingYou: true, defender: "player" },
      targets: [],
      effect: { kind: "damage", amount: 4, target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature with flying attacks you, this enchantment deals 4 damage to it.",
    },
  ],
});
