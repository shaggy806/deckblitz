import { defineCard } from "../define.js";

export default defineCard({
  name: "Terashi's Verdict",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Destroy target attacking creature with power 3 or less.",
  targets: [
    {
      kind: "permanent",
      filter: { attacking: true, type: "creature", power: { op: "lte", n: 3 } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
