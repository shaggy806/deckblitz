import { defineCard } from "../define.js";

export default defineCard({
  name: "Gleeful Sabotage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  conspire: true,
  text: "Destroy target artifact or enchantment.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: ["artifact-or-enchantment"],
  effect: { kind: "destroy", target: 0 },
});
