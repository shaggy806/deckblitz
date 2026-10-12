import { defineCard } from "../define.js";

// EDHREC rank 8096.
// Makes Servo → use "Servo Token".

export default defineCard({
  name: "Hidden Stockpile",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: "Revolt — At the beginning of your end step, if a permanent left the battlefield under your control this turn, create a 1/1 colorless Servo artifact creature token.\n{1}, Sacrifice a creature: Scry 1.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice a creature: Scry 1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: "Revolt — At the beginning of your end step, if a permanent left the battlefield under your control this turn, create a 1/1 colorless Servo artifact creature token.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
