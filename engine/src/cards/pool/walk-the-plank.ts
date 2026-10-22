import { defineCard } from "../define.js";

// EDHREC rank 11899.
export default defineCard({
  name: "Walk the Plank",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target non-Merfolk creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Merfolk"] } }],
  effect: { kind: "destroy", target: 0 },
});
