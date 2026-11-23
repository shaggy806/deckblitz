import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "If this is the first spell you've cast
// this game" is asked as it resolves, First Contact's condition.

export default defineCard({
  name: "Establishing Shot",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Establishing Shot deals 2 damage to any target. If this is the first spell you've cast this game, it deals 3 damage instead.",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { ifCondition: { kind: "first-spell-this-game" }, then: 3, else: 2 },
  },
});
