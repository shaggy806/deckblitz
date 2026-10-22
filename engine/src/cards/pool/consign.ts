import { defineCard } from "../define.js";

// The half of Consign // Oblivion cast from the hand.
const FACES = ["Consign // Oblivion", "Consign", "Oblivion"];

export default defineCard({
  name: "Consign",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent to its owner's hand.",
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  faces: FACES,
  split: true,
});
