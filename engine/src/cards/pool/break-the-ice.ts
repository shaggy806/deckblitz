import { defineCard } from "../define.js";

// EDHREC rank 24215.
// Overload (rule 702.126) — see Cyclonic Rift for the mechanism. "Could
// produce {C}" (rule 106.7) is the `couldProduce` filter clause.

const SNOW_OR_COLORLESS = { type: "land", anyOf: [{ supertype: "snow" }, { couldProduce: "C" }] } as const;

export default defineCard({
  name: "Break the Ice",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Destroy target land that is snow or could produce {C}.\n" +
    "Overload {4}{B}{B} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: [{ kind: "permanent", filter: SNOW_OR_COLORLESS }],
  effect: { kind: "destroy", target: 0 },
  overload: {
    cost: "{4}{B}{B}",
    effect: { kind: "destroy-all", filter: SNOW_OR_COLORLESS },
  },
});
