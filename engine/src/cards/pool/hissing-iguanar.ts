import { defineCard } from "../define.js";

// EDHREC rank 9671.

const TEXT = "Whenever another creature dies, you may have this creature deal 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Hissing Iguanar",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Deal 1 damage to target player or planeswalker?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
