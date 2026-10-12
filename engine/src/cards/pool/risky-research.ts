import { defineCard } from "../define.js";

// EDHREC rank 8047.

// Diresight's text and shape.
export default defineCard({
  name: "Risky Research",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Surveil 2, then draw two cards. You lose 2 life. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 2 },
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2 },
    ],
  },
});
