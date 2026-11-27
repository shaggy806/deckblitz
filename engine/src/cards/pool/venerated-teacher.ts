import { defineCard } from "../define.js";

// EDHREC rank 26248.
//
// Rulings:
//   A creature's level is based on how many level counters it has on it, not how many times its
//     level up ability has been activated or has resolved.

const TEXT = "When this creature enters, put two level counters on each creature you control with level up.";

export default defineCard({
  name: "Venerated Teacher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", hasKeyword: "level-up" },
        counter: "level",
        amount: 2,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
