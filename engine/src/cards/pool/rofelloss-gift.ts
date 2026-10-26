import { defineCard } from "../define.js";

// EDHREC rank 18769.
//
// Both the reveal and the choice of enchantment cards happen as it resolves
// (its ruling) — no targets. Fewer enchantment cards in the graveyard than
// were revealed returns them all.
const TEXT =
  "Reveal any number of green cards in your hand. Return an enchantment card from your graveyard to your hand for each card revealed this way.";

export default defineCard({
  name: "Rofellos's Gift",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { colors: ["G"] },
        destination: "reveal",
        leftover: "stay",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "revealed", atLeast: 1 },
        then: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: { thisWay: "revealed", who: "you" },
          max: { thisWay: "revealed", who: "you" },
          filter: { type: "enchantment" },
          destination: "hand",
          leftover: "stay",
        },
      },
    ],
  },
});
