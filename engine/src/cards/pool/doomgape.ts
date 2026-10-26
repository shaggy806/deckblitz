import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 19592.
//
// Rulings:
//   [2008-08-01] If you have no other creatures to sacrifice, you'll have to sacrifice
//     Doomgape itself. You'll gain life equal to its toughness.
//
// Consuming Vapors' shape: the sacrificed creature's toughness, as it last existed.

export default defineCard({
  name: "Doomgape",
  manaCost: "{4}{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 10,
  toughness: 10,
  keywords: ["trample"],
  text: "Trample\nAt the beginning of your upkeep, sacrifice a creature. You gain life equal to that creature's toughness.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
          { kind: "gain-life", amount: { thisWay: "sacrificed", sumOf: "toughness" } },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a creature. You gain life equal to that creature's toughness.",
    },
  ],
});
