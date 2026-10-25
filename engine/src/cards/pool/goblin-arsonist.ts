import { defineCard } from "../define.js";

const TEXT = "When this creature dies, you may have it deal 1 damage to any target.";

export default defineCard({
  name: "Goblin Arsonist",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have Goblin Arsonist deal 1 damage to the target?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
