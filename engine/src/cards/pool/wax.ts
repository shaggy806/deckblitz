import { defineCard } from "../define.js";

// The left half of Wax // Wane (see wax-wane.ts).
const FACES = ["Wax // Wane", "Wax", "Wane"];

export default defineCard({
  name: "Wax",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
