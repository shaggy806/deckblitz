import { defineCard } from "../define.js";

// Vintage Masters (VMA). EDHREC rank 23672.
//
// "Draw two cards, then discard one of them": Casting of Bones' `discard` of
// one card `{ thisWay: "drawn" }`, only a card the ability drew.

const NONBLACK_TEXT = "{T}, Discard a nonblack card: Draw a card.";
const BLACK_TEXT = "{T}, Discard a black card: Draw two cards, then discard one of them.";

export default defineCard({
  name: "Krovikan Sorcerer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 1,
  toughness: 1,
  text: NONBLACK_TEXT + "\n" + BLACK_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1, filter: { notColors: ["B"] } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: NONBLACK_TEXT,
    },
    {
      cost: { mana: null, tap: true, discard: { count: 1, filter: { colors: ["B"] } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1, filter: { thisWay: "drawn" } },
        ],
      },
      resolve: null,
      text: BLACK_TEXT,
    },
  ],
});
