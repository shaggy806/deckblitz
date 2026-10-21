import { defineCard } from "../define.js";

const FACES = ["Carnival // Carnage", "Carnival", "Carnage"];
const CARNIVAL_TEXT =
  "Carnival deals 1 damage to target creature or planeswalker and 1 damage to that permanent's controller.";

// The left half of Carnival // Carnage (see carnival-carnage.ts). Unleash
// Shell's shape: both damages at once, and none if the permanent is an
// illegal target (the ruling).
export default defineCard({
  name: "Carnival",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: CARNIVAL_TEXT,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "damage", amount: 1, toControllerOfTarget: 0 },
    ],
  },
  faces: FACES,
  split: true,
});
