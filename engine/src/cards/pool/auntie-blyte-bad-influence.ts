import { defineCard } from "../define.js";

// EDHREC rank 12188.

export default defineCard({
  name: "Auntie Blyte, Bad Influence",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Devil", "Advisor"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever a source you control deals damage to you, put that many +1/+1 counters on Auntie Blyte.\n{1}{R}, {T}, Remove X +1/+1 counters from Auntie Blyte: It deals X damage to any target.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever a source you control deals damage to you, put that many +1/+1 counters on Auntie Blyte.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{1}{R}, {T}, Remove X +1/+1 counters from Auntie Blyte: It deals X damage to any target.",
    },
  ],
});
