import { defineCard } from "../define.js";

const FACES = ["Fast // Furious", "Fast", "Furious"];
const FAST_TEXT = "Discard a card, then draw two cards.";

export default defineCard({
  name: "Fast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: FAST_TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 1 },
      { kind: "draw", amount: 2 },
    ],
  },
  faces: FACES,
  split: true,
});
