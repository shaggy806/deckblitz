import { defineCard } from "../define.js";

// EDHREC rank 28953.
//
// Hellbent is checked as the spell resolves (it's on the stack then, not in
// the hand).

export default defineCard({
  name: "Cackling Flames",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Cackling Flames deals 3 damage to any target.\nHellbent — Cackling Flames deals 5 damage instead if you have no cards in hand.",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { ifCondition: { kind: "hand-size", atMost: 0 }, then: 5, else: 3 },
  },
});
