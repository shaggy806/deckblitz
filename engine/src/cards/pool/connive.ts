import { defineCard } from "../define.js";

const FACES = ["Connive // Concoct", "Connive", "Concoct"];
const CONNIVE_TEXT = "Gain control of target creature with power 2 or less.";

// The left half of Connive // Concoct (see connive-concoct.ts). The control
// change lasts indefinitely, even once the creature's power grows (ruling).
export default defineCard({
  name: "Connive",
  manaCost: "{2}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: CONNIVE_TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
  faces: FACES,
  split: true,
});
