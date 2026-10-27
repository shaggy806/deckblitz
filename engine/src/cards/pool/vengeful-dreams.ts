import { defineCard } from "../define.js";

// EDHREC rank 24140. Torment.

export default defineCard({
  name: "Vengeful Dreams",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard X cards.\nExile X target attacking creatures.",
  additionalCost: { discard: "x" },
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", attacking: true } }, min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
});
