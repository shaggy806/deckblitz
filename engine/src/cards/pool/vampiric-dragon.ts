import { defineCard } from "../define.js";

// EDHREC rank 20068.

export default defineCard({
  name: "Vampiric Dragon",
  manaCost: "{6}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.\n{1}{R}: This creature deals 1 damage to target creature.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}: This creature deals 1 damage to target creature.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
    },
  ],
});
