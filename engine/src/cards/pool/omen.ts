import { defineCard } from "../define.js";

// Portal (POR). EDHREC rank 21429. Ponder's text, at {1}{U}.

export default defineCard({
  name: "Omen",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library, then put them back in any order. You may shuffle.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 3,
        max: 3,
        destination: "library-top",
        leftover: "stay",
      },
      { kind: "may", prompt: "Shuffle your library?", effect: { kind: "shuffle-library" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
