import { defineCard } from "../define.js";

// The left half of Discovery // Dispersal.
const FACES = ["Discovery // Dispersal", "Discovery", "Dispersal"];

export default defineCard({
  name: "Discovery",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Surveil 2, then draw a card. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: [],
  effect: { kind: "surveil", amount: 2, then: { kind: "draw", amount: 1 } },
  faces: FACES,
  split: true,
});
