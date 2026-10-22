import { defineCard } from "../define.js";

// The half of Farm // Market cast from the hand.
const FACES = ["Farm // Market", "Farm", "Market"];

export default defineCard({
  name: "Farm",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking or blocking creature.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
