import { defineCard } from "../define.js";

// EDHREC rank 4961.
//
// Rulings:
//   [2023-02-04] You can choose no targets for The Bath Song's final chapter ability just to add
//     {U}{U}. However, if you do choose targets, and all of those targets are illegal at the time
//     the ability tries to resolve, the ability won't resolve and none of its effects will happen.
//     You won't add {U}{U}.
//   [2023-02-04] The Bath Song's final chapter ability is not a mana ability. It uses the stack and
//     can be responded to.
//
// Chapter III's shuffle is Piper's Melody's (each target onto the library,
// then a shuffle), then the mana.
const I_II_TEXT = "I, II — Draw two cards, then discard a card.";
const III_TEXT = "III — Shuffle any number of target cards from your graveyard into your library. Add {U}{U}.";

export default defineCard({
  name: "The Bath Song",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: I_II_TEXT,
    },
    {
      at: [3],
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
          { kind: "shuffle-library" },
          { kind: "add-mana", mana: "U", amount: 2 },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
