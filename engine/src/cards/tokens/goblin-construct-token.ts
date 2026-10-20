import { defineCard } from "../define.js";

// Relic Robber's Goblin Construct token.

export default defineCard({
  name: "Goblin Construct Token",
  art: "b24a63e2-c2b3-43f8-a15a-68886bec7d60",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Goblin", "Construct"],
  power: 0,
  toughness: 1,
  text: "This creature can't block.\nAt the beginning of your upkeep, this creature deals 1 damage to you.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, this creature deals 1 damage to you.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
