import { defineCard } from "../define.js";

// EDHREC rank 11190. Weatherlight.

export default defineCard({
  name: "Firestorm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard X cards.\nFirestorm deals X damage to each of X targets.",
  // X is capped by the cards in hand and by the legal targets (the rulings).
  additionalCost: { discard: "x" },
  targets: [{ kind: "any-number", of: "any-target", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "damage", amount: "x", target: 0 } },
});
