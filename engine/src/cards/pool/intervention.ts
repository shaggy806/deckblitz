import { defineCard } from "../define.js";

const FACES = ["Integrity // Intervention", "Integrity", "Intervention"];
const INTERVENTION_TEXT = "Intervention deals 3 damage to any target and you gain 3 life.";

// The right half of Integrity // Intervention (see integrity-intervention.ts).
// With its target illegal it doesn't resolve, so no life (the ruling).
export default defineCard({
  name: "Intervention",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: INTERVENTION_TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "gain-life", amount: 3 },
    ],
  },
  faces: FACES,
  split: true,
});
