import { defineCard } from "../define.js";

// Mosswood Dreadknight's Adventure.
export default defineCard({
  name: "Dread Whispers",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "You draw a card and you lose 1 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "lose-life", amount: 1 },
    ],
  },
  faces: ["Mosswood Dreadknight", "Dread Whispers"],
  adventure: true,
});
