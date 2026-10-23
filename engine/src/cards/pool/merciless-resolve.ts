import { defineCard } from "../define.js";

// EDHREC rank 19147.
//
// Rulings:
//   You must sacrifice exactly one creature or land to cast Merciless Resolve.

export default defineCard({
  name: "Merciless Resolve",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature or land.\nDraw two cards.",
  additionalCost: { sacrifice: { typesAnyOf: ["creature", "land"] } },
  targets: [],
  effect: { kind: "draw", amount: 2 },
});
