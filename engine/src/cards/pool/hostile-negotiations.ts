import { defineCard } from "../define.js";

// Both piles are made face down and looked at only by you; the one you turn up
// is the only one the opponent sees, chosen only once you've seen the cards.
export default defineCard({
  name: "Hostile Negotiations",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile the top three cards of your library in a face-down pile, then exile the top three cards of your library in another face-down pile. Look at the cards in each pile, then turn a pile of your choice face up. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard. You lose 3 life.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "exile-into-piles",
        piles: [{ libraryTop: 3 }, { libraryTop: 3 }],
        turnOneFaceUp: true,
        chooser: "an-opponent",
        chosen: "hand",
        rest: "graveyard",
      },
      { kind: "lose-life", amount: 3 },
    ],
  },
});
