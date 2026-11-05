import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`; each copy may
// choose a new target.
export default defineCard({
  name: "Consign to Memory",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{1}", keyword: "replicate", multi: true },
  text:
    "Replicate {1} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nCounter target triggered ability or colorless spell.",
  targets: [
    {
      kind: "one-of",
      of: [
        { kind: "ability", abilityKind: "triggered" },
        { kind: "spell", filter: { colorless: true } },
      ],
    },
  ],
  effect: { kind: "counter", target: 0 },
});
