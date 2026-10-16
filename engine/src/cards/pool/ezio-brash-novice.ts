import { defineCard } from "../define.js";

// EDHREC rank 12933.
//
// Rulings:
//   [2024-07-05] If Ezio loses first strike after it has already dealt first-strike combat damage
//     but before regular combat damage has been dealt, it won't also deal regular combat damage
//     (unless it somehow has double strike).
//
// - "Two or more counters" is any kind, summed: `self-counters` with no
//   `counter`. Skyknight Squire's shape otherwise.

const STATIC_TEXT =
  "As long as Ezio has two or more counters on it, it has first strike and is an Assassin in addition to its other types.";

export default defineCard({
  name: "Ezio, Brash Novice",
  manaCost: "{1}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: `Whenever Ezio attacks, put a +1/+1 counter on it.\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever Ezio attacks, put a +1/+1 counter on it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 2 } },
      addSubtypes: ["Assassin"],
      grantKeywords: ["first-strike"],
      text: STATIC_TEXT,
    },
  ],
});
