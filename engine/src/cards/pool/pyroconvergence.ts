import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a multicolored spell, this enchantment deals 2 damage to any target.";

export default defineCard({
  name: "Pyroconvergence",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
