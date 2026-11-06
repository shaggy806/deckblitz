import { defineCard } from "../define.js";

// EDHREC rank 32566.

export default defineCard({
  name: "Tal Shiar Analyst",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Romulan", "Scientist"],
  power: 3,
  toughness: 2,
  text: "{T}: This creature deals 1 damage to each opponent.\nWhenever you cast a noncreature spell, untap this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "{T}: This creature deals 1 damage to each opponent.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, untap this creature.",
    },
  ],
});
