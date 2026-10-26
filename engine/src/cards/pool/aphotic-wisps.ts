import { defineCard } from "../define.js";

// Rulings: the colour change overwrites the creature's old colours (rule 105.3 — layer 5).

export default defineCard({
  name: "Aphotic Wisps",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature becomes black and gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become-color", target: 0, colors: ["B"], duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
