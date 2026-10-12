import { defineCard } from "../define.js";

export default defineCard({
  name: "Death Stroke",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target tapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
