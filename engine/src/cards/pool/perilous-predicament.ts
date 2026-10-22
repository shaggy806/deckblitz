import { defineCard } from "../define.js";

// Rulings:
//   An opponent whose creatures are all artifacts (or all nonartifacts)
//     sacrifices only one; one with no creatures sacrifices nothing.
//   Each opponent chooses in turn order, then all are sacrificed at once.
//
// The `sacrifice` effect's `andEach`: one part per filter, each paid by a
// different permanent, a part with nothing to pay it skipped, and every
// choice sacrificed together (rule 101.4).
export default defineCard({
  name: "Perilous Predicament",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Each opponent sacrifices an artifact creature and a nonartifact creature of their choice.",
  targets: [],
  effect: {
    kind: "sacrifice",
    who: "each-opponent",
    filter: { types: ["artifact", "creature"] },
    count: 1,
    andEach: [{ type: "creature", notTypes: ["artifact"] }],
  },
});
