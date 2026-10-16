import { defineCard } from "../define.js";

// EDHREC rank 10923. Forbidden Alchemy's look, then the life.

export default defineCard({
  name: "Commune with Evil",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard. You gain 3 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 4, min: 1, max: 1, destination: "hand", leftover: "graveyard" },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
