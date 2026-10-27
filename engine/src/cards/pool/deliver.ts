import { defineCard } from "../define.js";

// The right half of Stand // Deliver (see stand-deliver.ts).
const FACES = ["Stand // Deliver", "Stand", "Deliver"];

export default defineCard({
  name: "Deliver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target permanent to its owner's hand.",
  targets: ["permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  faces: FACES,
  split: true,
});
