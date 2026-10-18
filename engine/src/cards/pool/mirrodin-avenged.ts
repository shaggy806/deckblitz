import { defineCard } from "../define.js";

// EDHREC rank 10509.

export default defineCard({
  name: "Mirrodin Avenged",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature that was dealt damage this turn.\nDraw a card.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
