import { defineCard } from "../define.js";

export default defineCard({
  name: "Aether Charge",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever a Beast you control enters, you may have it deal 4 damage to target opponent or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Beast" } },
      targets: ["opponent-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Have the Beast deal 4 damage to the target?",
        effect: { kind: "damage", amount: 4, target: 0, from: "trigger-object" },
      },
      resolve: null,
      text: "Whenever a Beast you control enters, you may have it deal 4 damage to target opponent or planeswalker.",
    },
  ],
});
