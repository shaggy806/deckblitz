import { defineCard } from "../define.js";

// EDHREC rank 29338.

export default defineCard({
  name: "Osai Vultures",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of each end step, if a creature died this turn, put a carrion counter on this creature.\nRemove two carrion counters from this creature: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "carrion", count: 2 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Remove two carrion counters from this creature: This creature gets +1/+1 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "carrion", amount: 1 },
      resolve: null,
      text: "At the beginning of each end step, if a creature died this turn, put a carrion counter on this creature.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
