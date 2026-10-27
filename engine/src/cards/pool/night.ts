import { defineCard } from "../define.js";

const FACES = ["Night // Day", "Night", "Day"];

// The left half of Night // Day (see night-day.ts).
export default defineCard({
  name: "Night",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -1/-1 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
