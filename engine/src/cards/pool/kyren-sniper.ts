import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, you may have this creature deal 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Kyren Sniper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Have Kyren Sniper deal 1 damage to target player or planeswalker?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
