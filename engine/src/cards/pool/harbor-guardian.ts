import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31732.

const TEXT = "Whenever this creature attacks, defending player may draw a card.";

export default defineCard({
  name: "Harbor Guardian",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
