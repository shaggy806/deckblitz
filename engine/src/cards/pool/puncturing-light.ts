import { defineCard } from "../define.js";

// EDHREC rank 27048. Searing Light's target; the power is checked as it's
// targeted and again as it resolves (the ruling).

export default defineCard({
  name: "Puncturing Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking or blocking creature with power 3 or less.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", power: { op: "lte", n: 3 }, anyOf: [{ attacking: true }, { blocking: true }] },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
