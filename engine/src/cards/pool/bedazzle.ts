import { defineCard } from "../define.js";

const FACES = ["Bedeck // Bedazzle", "Bedeck", "Bedazzle"];

// The right half of Bedeck // Bedazzle (rule 709). Both targets are required
// to cast it; if one is illegal as it resolves, the other is still affected
// (the ruling — each step reads only its own slot).
export default defineCard({
  name: "Bedazzle",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Destroy target nonbasic land. Bedazzle deals 2 damage to target opponent or planeswalker.",
  targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }, "opponent-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
  faces: FACES,
  split: true,
});
