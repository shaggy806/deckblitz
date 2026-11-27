import { defineCard } from "../define.js";

const FACES = ["Trial // Error", "Trial", "Error"];

export default defineCard({
  name: "Error",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Counter target multicolored spell.",
  targets: [{ kind: "spell", filter: { multicolored: true } }],
  effect: { kind: "counter", target: 0 },
  faces: FACES,
  split: true,
});
