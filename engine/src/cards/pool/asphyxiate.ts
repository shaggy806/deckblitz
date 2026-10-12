import { defineCard } from "../define.js";

export default defineCard({
  name: "Asphyxiate",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target untapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: false, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
