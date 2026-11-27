import { defineCard } from "../define.js";

// EDHREC rank 22750. A resolved "next time you would draw" replacement
// (rule 614.1a), the ability's X kept with it for the look. The card kept
// goes back on top and is the one drawn.
//
// Rulings:
//   If you use more than one Lamp effect, the second one will end up replacing the card
//   being drawn with the first one.

const TEXT =
  "{X}, {T}: The next time you would draw a card this turn, instead look at the top X cards of your library, put all but one of them on the bottom of your library in a random order, then draw a card. X can't be 0.";

export default defineCard({
  name: "Aladdin's Lamp",
  manaCost: "{10}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      minX: 1,
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        replacement: {
          event: "would-draw",
          who: "you",
          instead: {
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "look-and-choose",
                  zone: "library",
                  count: "x",
                  min: 1,
                  max: 1,
                  destination: "library-top",
                  leftover: "bottom-random",
                },
                { kind: "draw", amount: 1 },
              ],
            },
            text: "Look at the top X cards, put all but one on the bottom in a random order, then draw a card instead.",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
