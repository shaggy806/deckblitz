import { defineCard } from "../define.js";

export default defineCard({
  name: "Assassinate",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target tapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
