import { defineCard } from "../define.js";

// The half of Never // Return cast from the hand.
const FACES = ["Never // Return", "Never", "Return"];

export default defineCard({
  name: "Never",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
