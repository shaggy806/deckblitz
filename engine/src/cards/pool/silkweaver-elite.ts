import { defineCard } from "../define.js";

// EDHREC rank 25081.

export default defineCard({
  name: "Silkweaver Elite",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nRevolt — When this creature enters, if a permanent left the battlefield under your control this turn, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, draw a card.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
