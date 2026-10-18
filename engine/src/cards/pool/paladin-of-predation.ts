import { defineCard } from "../define.js";

// EDHREC rank 11276.
//
// Rulings:
//   [2023-02-04] Once it has become blocked, reducing the power of a creature blocking Paladin of
//     Predation to less than 2 won't cause it to become unblocked.

export default defineCard({
  name: "Paladin of Predation",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 6,
  toughness: 7,
  toxic: 6,
  text: "Toxic 6 (Players dealt combat damage by this creature also get six poison counters.)\nThis creature can't be blocked by creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
