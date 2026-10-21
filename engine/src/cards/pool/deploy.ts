import { defineCard } from "../define.js";

const FACES = ["Depose // Deploy", "Depose", "Deploy"];

// The right half of Depose // Deploy (rule 709). The life is counted after
// the Thopters arrive, so they count (the ruling: both in one resolution).
export default defineCard({
  name: "Deploy",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Create two 1/1 colorless Thopter artifact creature tokens with flying, then you gain 1 life for each creature you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Thopter Token", count: 2 },
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
    ],
  },
  faces: FACES,
  split: true,
});
