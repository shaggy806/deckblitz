import { defineCard } from "../define.js";

// Two targets, both required to cast it; if one is illegal as it resolves,
// the other is still destroyed (the ruling).
export default defineCard({
  name: "Spiteful Blow",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature and target land.",
  targets: ["creature", "land"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});
