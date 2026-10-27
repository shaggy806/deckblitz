import { defineCard } from "../define.js";

// The left half of Stand // Deliver (see stand-deliver.ts).
const FACES = ["Stand // Deliver", "Stand", "Deliver"];

export default defineCard({
  name: "Stand",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 2 damage that would be dealt to target creature this turn.",
  targets: ["creature"],
  effect: { kind: "prevent-damage", target: 0, amount: 2 },
  faces: FACES,
  split: true,
});
