import { defineCard } from "../define.js";

const FACES = ["Integrity // Intervention", "Integrity", "Intervention"];
const INTEGRITY_TEXT = "Target creature gets +2/+2 until end of turn.";

// The left half of Integrity // Intervention (see integrity-intervention.ts).
export default defineCard({
  name: "Integrity",
  manaCost: "{R/W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: INTEGRITY_TEXT,
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
