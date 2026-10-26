import { defineCard } from "../define.js";

export default defineCard({
  name: "Barkshell Blessing",
  manaCost: "{G/W}",
  colors: ["G", "W"],
  types: ["instant"],
  conspire: true,
  text: "Target creature gets +2/+2 until end of turn.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
});
