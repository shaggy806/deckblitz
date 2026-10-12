import { defineCard } from "../define.js";

// "Your first main phase" is the precombat main phase (rule 505.1a). The
// "you may" isn't offered without a creature to blight (701.68b).
export default defineCard({
  name: "Scuzzback Scrounger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 2,
  text: "At the beginning of your first main phase, you may blight 1. If you do, create a Treasure token. (To blight 1, put a -1/-1 counter on a creature you control. A Treasure token is an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 1?",
        effect: { kind: "blight", amount: 1 },
        then: { kind: "create-token", token: "Treasure Token", count: 1 },
      },
      resolve: null,
      text: "At the beginning of your first main phase, you may blight 1. If you do, create a Treasure token.",
    },
  ],
});
