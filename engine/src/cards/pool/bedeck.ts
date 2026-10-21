import { defineCard } from "../define.js";

const FACES = ["Bedeck // Bedazzle", "Bedeck", "Bedazzle"];

// The left half of Bedeck // Bedazzle (rule 709).
export default defineCard({
  name: "Bedeck",
  manaCost: "{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Target creature gets +3/-3 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: -3, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
