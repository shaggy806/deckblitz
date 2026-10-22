import { defineCard } from "../define.js";

// The half of Onward // Victory cast from the hand. X is the target's power as
// Onward resolves, fixed from then on (the ruling).
const FACES = ["Onward // Victory", "Onward", "Victory"];

export default defineCard({
  name: "Onward",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +X/+0 until end of turn, where X is its power.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: { powerOf: 0 }, toughness: 0, duration: "end-of-turn" },
  faces: FACES,
  split: true,
});
