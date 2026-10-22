import { defineCard } from "../define.js";

// The half of Struggle // Survive cast from the hand.
const FACES = ["Struggle // Survive", "Struggle", "Survive"];

export default defineCard({
  name: "Struggle",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Struggle deals damage to target creature equal to the number of lands you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
  faces: FACES,
  split: true,
});
