import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 16431. Conch Horn's shape, to the bottom.

export default defineCard({
  name: "Amass the Components",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw three cards, then put a card from your hand on the bottom of your library.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-bottom", leftover: "stay" },
    ],
  },
});
