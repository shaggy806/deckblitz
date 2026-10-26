import { defineCard } from "../define.js";

// Untargeted (the ruling): the damage goes to the entering creature itself.

export default defineCard({
  name: "Aether Flash",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever a creature enters, this enchantment deals 2 damage to it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", amount: 2, target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature enters, this enchantment deals 2 damage to it.",
    },
  ],
});
