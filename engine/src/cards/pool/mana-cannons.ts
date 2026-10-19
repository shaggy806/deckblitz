import { defineCard } from "../define.js";

export default defineCard({
  name: "Mana Cannons",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever you cast a multicolored spell, this enchantment deals X damage to any target, where X is the number of colors that spell is.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { colorsOf: "trigger-object" }, target: 0 },
      resolve: null,
      text: "Whenever you cast a multicolored spell, this enchantment deals X damage to any target, where X is the number of colors that spell is.",
    },
  ],
});
