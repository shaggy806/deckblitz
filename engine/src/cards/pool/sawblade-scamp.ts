import { defineCard } from "../define.js";

// EDHREC rank 10753.

export default defineCard({
  name: "Sawblade Scamp",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nWhenever you cast a noncreature spell, put an oil counter on this creature.\n{T}, Remove an oil counter from this creature: It deals 1 damage to each opponent.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "{T}, Remove an oil counter from this creature: It deals 1 damage to each opponent.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put an oil counter on this creature.",
    },
  ],
});
