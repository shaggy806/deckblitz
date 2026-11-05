import { defineCard } from "../define.js";

// EDHREC rank 23415.

export default defineCard({
  name: "Myr Prototype",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 2,
  toughness: 2,
  text: "At the beginning of your upkeep, put a +1/+1 counter on this creature.\nThis creature can't attack or block unless you pay {1} for each +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      combatTax: { on: ["attack", "block"], generic: 1, perCounter: "+1/+1" },
      text: "This creature can't attack or block unless you pay {1} for each +1/+1 counter on it.",
    },
  ],
});
