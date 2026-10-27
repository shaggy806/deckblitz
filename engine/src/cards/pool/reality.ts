import { defineCard } from "../define.js";

const FACES = ["Illusion // Reality", "Illusion", "Reality"];

// The right half of Illusion // Reality (see illusion-reality.ts).
export default defineCard({
  name: "Reality",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact.",
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
