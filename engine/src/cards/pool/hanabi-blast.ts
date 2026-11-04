import { defineCard } from "../define.js";

// It goes back in the order written, before the discard: `now`, so the random
// discard can take it. Its owner's hand, then its caster discards (the ruling).
export default defineCard({
  name: "Hanabi Blast",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Hanabi Blast deals 2 damage to any target. Return Hanabi Blast to its owner's hand, then discard a card at random.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "return-to-hand", target: "source", from: "stack", now: true },
      { kind: "discard", target: "you", amount: 1, random: true },
    ],
  },
});
