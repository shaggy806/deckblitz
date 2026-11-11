import { defineCard } from "../define.js";

const FACES = ["Response // Resurgence", "Response", "Resurgence"];

// The left half of Response // Resurgence (see response-resurgence.ts).
export default defineCard({
  name: "Response",
  manaCost: "{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Response deals 5 damage to target attacking or blocking creature.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
  faces: FACES,
  split: true,
});
