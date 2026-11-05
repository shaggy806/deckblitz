import { defineCard } from "../define.js";

// EDHREC rank 16259. The ruling's six steps. The revealed cards stay in the library while they're separated (rule 700.3c),
// so once you've taken a card from the chosen pile (nothing asked with one in it,
// nothing taken from an empty one) every other revealed card is still on top, and
// all of them go to the bottom as one ordering, both piles' cards mixed as you
// like.
export default defineCard({
  name: "Truth or Tale",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Reveal the top five cards of your library and separate them into two piles. An opponent chooses one of those piles. Put a card from the chosen pile into your hand, then put all other cards revealed this way on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "separate-into-piles",
        objects: { libraryTop: 5, reveal: true },
        chooser: "an-opponent",
        chosen: {
          together: {
            kind: "choose-among-targets",
            chooser: "you",
            count: 1,
            prompt: "Choose the card to put into your hand",
            chosen: "hand",
          },
          word: "hand",
        },
      },
      {
        kind: "look-and-choose",
        zone: "library",
        count: { difference: [5, { thisWay: "put-into-hand" }] },
        min: 0,
        max: 0,
        destination: "hand",
        leftover: "bottom-any-order",
      },
    ],
  },
});
