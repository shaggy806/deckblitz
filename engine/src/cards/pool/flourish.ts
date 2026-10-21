import { defineCard } from "../define.js";

const FACES = ["Flower // Flourish", "Flower", "Flourish"];
const FLOURISH_TEXT = "Creatures you control get +2/+2 until end of turn.";

// The right half of Flower // Flourish (see flower-flourish.ts). Only the
// creatures you control as it resolves get +2/+2 (the ruling).
export default defineCard({
  name: "Flourish",
  manaCost: "{4}{G}{W}",
  colors: ["G", "W"],
  types: ["sorcery"],
  text: FLOURISH_TEXT,
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 2,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
