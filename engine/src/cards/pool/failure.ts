import { defineCard } from "../define.js";

const FACES = ["Failure // Comply", "Failure", "Comply"];

export default defineCard({
  name: "Failure",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target spell to its owner's hand.",
  targets: ["spell"],
  effect: { kind: "return-to-hand", target: 0, from: "stack" },
  faces: FACES,
  split: true,
});
