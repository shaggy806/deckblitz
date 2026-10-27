import { defineCard } from "../define.js";

// The right half of Wax // Wane (see wax-wane.ts).
const FACES = ["Wax // Wane", "Wax", "Wane"];

export default defineCard({
  name: "Wane",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target enchantment.",
  targets: ["enchantment"],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
