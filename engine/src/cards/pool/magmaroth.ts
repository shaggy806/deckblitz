import { defineCard } from "../define.js";

// Rulings:
//   [2017-07-14] Magmaroth's second ability resolves before the spell that caused it to trigger.
//     The ability will resolve even if that spell is countered.

export default defineCard({
  name: "Magmaroth",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  text: "At the beginning of your upkeep, put a -1/-1 counter on this creature.\nWhenever you cast a noncreature spell, remove a -1/-1 counter from this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a -1/-1 counter on this creature.",
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, remove a -1/-1 counter from this creature.",
    },
  ],
});
