import { defineCard } from "../define.js";

export default defineCard({
  name: "Traitor's Roar",
  manaCost: "{4}{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  conspire: true,
  text: "Tap target untapped creature. It deals damage equal to its power to its controller.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: [{ kind: "permanent", filter: { type: "creature", tapped: false } }],
  effect: { kind: "sequence", effects: [{ kind: "tap", target: 0 }, { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0, from: { target: 0 } }] },
});
