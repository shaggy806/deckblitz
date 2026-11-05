import { defineCard } from "../define.js";

// EDHREC rank 5002.
//
// Fortune's Favor's piles with the opponent chosen rather than targeted, and
// you choosing between them; only that opponent looks (the rulings).
export default defineCard({
  name: "Sauron's Ransom",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Choose an opponent. They look at the top four cards of your library and separate them into a face-down pile and a face-up pile. Put one pile into your hand and the other into your graveyard. The Ring tempts you.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-opponent",
        then: {
          kind: "separate-into-piles",
          objects: { libraryTop: 4 },
          faceDown: true,
          separator: "that-player",
          chooser: "you",
          chosen: "hand",
          rest: "graveyard",
        },
      },
      { kind: "the-ring-tempts-you" },
    ],
  },
});
