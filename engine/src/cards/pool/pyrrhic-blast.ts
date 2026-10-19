import { defineCard } from "../define.js";

// EDHREC rank 16350. Fling, then a card.
//
// Rulings:
//   You must sacrifice exactly one creature to cast this spell.
//   The sacrificed creature's last known existence on the battlefield is checked to determine its
//   power (`powerOf: "sacrificed"`).

export default defineCard({
  name: "Pyrrhic Blast",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "As an additional cost to cast this spell, sacrifice a creature.\n" +
    "Pyrrhic Blast deals damage equal to the sacrificed creature's power to any target. Draw a card.",
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: { powerOf: "sacrificed" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
