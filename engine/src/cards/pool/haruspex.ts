import { defineCard } from "../define.js";

// EDHREC rank 12154.

export default defineCard({
  name: "Haruspex",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 2,
  toughness: 2,
  text: "Rapacious Hunger — Whenever another creature dies, put a +1/+1 counter on this creature.\nDevouring Monster — {T}, Remove X +1/+1 counters from this creature: Add X mana of any one color.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Rapacious Hunger — Whenever another creature dies, put a +1/+1 counter on this creature.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: "x" },
      resolve: null,
      text: "Devouring Monster — {T}, Remove X +1/+1 counters from this creature: Add X mana of any one color.",
    },
  ],
});
