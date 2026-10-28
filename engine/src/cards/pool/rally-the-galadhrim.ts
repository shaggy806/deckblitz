import { defineCard } from "../define.js";

export default defineCard({
  name: "Rally the Galadhrim",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  conspire: true,
  text: "Create a token that's a copy of target creature you control.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1 },
});
