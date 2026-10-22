import { defineCard } from "../define.js";

// The half of Reason // Believe cast from the hand.
const FACES = ["Reason // Believe", "Reason", "Believe"];

export default defineCard({
  name: "Reason",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Scry 3.",
  targets: [],
  effect: { kind: "scry", amount: 3 },
  faces: FACES,
  split: true,
});
