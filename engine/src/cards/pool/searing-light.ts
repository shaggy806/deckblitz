import { defineCard } from "../define.js";

export default defineCard({
  name: "Searing Light",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking or blocking creature with power 2 or less.",
  targets: [
    {
      kind: "permanent",
      filter: {
        type: "creature",
        power: { op: "lte", n: 2 },
        anyOf: [{ attacking: true }, { blocking: true }],
      },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
