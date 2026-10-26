import { defineCard } from "../define.js";

export default defineCard({
  name: "Aethertow",
  manaCost: "{3}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  conspire: true,
  text: "Put target attacking or blocking creature on top of its owner's library.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] } }],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
