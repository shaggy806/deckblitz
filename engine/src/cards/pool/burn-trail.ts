import { defineCard } from "../define.js";

export default defineCard({
  name: "Burn Trail",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  conspire: true,
  text: "Burn Trail deals 3 damage to any target.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
