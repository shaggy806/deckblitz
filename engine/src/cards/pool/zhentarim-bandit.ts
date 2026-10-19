import { defineCard } from "../define.js";

export default defineCard({
  name: "Zhentarim Bandit",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Halfling", "Rogue"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, you may pay 1 life. If you do, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 1 life to create a Treasure token?",
        costLife: 1,
        effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may pay 1 life. If you do, create a Treasure token.",
    },
  ],
});
