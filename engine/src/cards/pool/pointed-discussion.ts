import { defineCard } from "../define.js";

export default defineCard({
  name: "Pointed Discussion",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw two cards, lose 2 life, then create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2, who: "you" },
      { kind: "create-token", token: "Blood Token", count: 1 },
    ],
  },
});
