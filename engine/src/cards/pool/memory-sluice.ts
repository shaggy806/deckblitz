import { defineCard } from "../define.js";

export default defineCard({
  name: "Memory Sluice",
  manaCost: "{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  conspire: true,
  text: "Target player mills four cards.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: ["player"],
  effect: { kind: "mill", target: 0, amount: 4 },
});
