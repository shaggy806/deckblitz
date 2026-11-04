import { defineCard } from "../define.js";

// Nobody looks at the face-down pile before the opponent chooses: you look at
// the other pile only then, and may cast one spell from it free. The chosen
// pile is the one that goes to the graveyard.
export default defineCard({
  name: "Abstract Performance",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile the top four cards of your library in a face-down pile, then exile the top four cards of your library in a face-up pile. An opponent chooses one of those piles. Put that pile into your graveyard. Look at the cards in the other pile. You may cast a spell from among them without paying its mana cost. Put the rest into your hand.",
  effect: {
    kind: "exile-into-piles",
    piles: [{ libraryTop: 4 }, { libraryTop: 4, faceUp: true }],
    chooser: "an-opponent",
    chosen: "graveyard",
    rest: {
      word: "cast-or-hand",
      together: { kind: "cast-now", from: "targets", free: true, rest: "hand" },
    },
  },
});
