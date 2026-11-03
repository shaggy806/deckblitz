import { defineCard } from "../define.js";

// EDHREC rank 1928.
//
// Overloaded it has no targets (the rulings), so it reaches a creature with
// hexproof or with protection from colorless.

export default defineCard({
  name: "Eldritch Immunity",
  manaCost: "{C}",
  colors: [],
  types: ["kindred", "instant"],
  subtypes: ["Eldrazi"],
  text: 'Target creature you control gains protection from each color until end of turn.\nOverload {4}{C} (You may cast this spell for its overload cost. If you do, change "target" in its text to "each.")',
  targets: ["creature-you-control"],
  effect: {
    kind: "grant-protection",
    target: 0,
    from: { colors: ["W", "U", "B", "R", "G"] },
    duration: "end-of-turn",
  },
  overload: {
    cost: "{4}{C}",
    effect: {
      kind: "grant-protection",
      filter: { type: "creature", controlledBy: "you" },
      from: { colors: ["W", "U", "B", "R", "G"] },
      duration: "end-of-turn",
    },
  },
});
