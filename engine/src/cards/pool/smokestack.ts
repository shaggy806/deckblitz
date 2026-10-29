import { defineCard } from "../define.js";

// EDHREC rank 8603.
//
// The soot counters are counted as the second ability resolves; a player
// with fewer permanents sacrifices all of them (its ruling).

export default defineCard({
  name: "Smokestack",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your upkeep, you may put a soot counter on this artifact.\nAt the beginning of each player's upkeep, that player sacrifices a permanent of their choice for each soot counter on this artifact.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a soot counter on Smokestack?",
        effect: { kind: "add-counter", target: "source", counter: "soot", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a soot counter on this artifact.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "active-player",
        filter: {},
        count: { countersOn: "source", counter: "soot" },
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player sacrifices a permanent of their choice for each soot counter on this artifact.",
    },
  ],
});
