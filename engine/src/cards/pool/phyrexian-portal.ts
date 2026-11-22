import { defineCard } from "../define.js";

const TEXT =
  "{3}: If your library has ten or more cards in it, target opponent looks at the top ten cards of your library and separates them into two face-down piles. Exile one of those piles. Search the other pile for a card, put it into your hand, then shuffle the rest of that pile into your library.";

// The opponent looks at the cards and separates them; they stay in the library
// while separated (rule 700.3c), unseen by anyone else, so the controller
// chooses which pile to exile without seeing either. The other pile's cards are
// still on top of the library: the controller searches them (a look, then one
// card to hand: "a card" with no quality must be found, rule 701.23b), and
// shuffling "the rest of that pile into your library" shuffles the library.
export default defineCard({
  name: "Phyrexian Portal",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "conditional",
        condition: { kind: "library-size", who: "you", atLeast: 10 },
        then: {
          kind: "separate-into-piles",
          objects: { libraryTop: 10 },
          faceDown: "both",
          separator: { target: 0 },
          chooser: "you",
          chosen: "exile",
          rest: {
            together: {
              kind: "sequence",
              effects: [
                {
                  kind: "look-and-choose",
                  zone: "targets",
                  min: 1,
                  max: 1,
                  destination: "hand",
                  leftover: "stay",
                  prompt: "Search the pile for a card to put into your hand",
                },
                { kind: "shuffle-library" },
              ],
            },
            word: "hand",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
