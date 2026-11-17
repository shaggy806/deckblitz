import { defineCard } from "../define.js";

// EDHREC rank 11610.
//
// Rulings:
//   [2004-10-04] You are never forced to sacrifice any permanents. You can choose to discard your
//     entire hand if your hand is smaller than the number of cards you are required to discard.
//   [2004-10-04] You draw the cards, then sacrifice any permanents you want to sacrifice, then
//     discard the required number of card from your hand. There is no chance to play any cards in
//     between these actions.
//
// "For each card drawn this way, discard a card unless you sacrifice a permanent": the second
// ruling's order. Up to one permanent for each card actually drawn (`thisWay: "drawn"` — a short
// library draws fewer) is chosen and sacrificed, none at all included (the first ruling), then a
// card is discarded for each card drawn that no sacrifice answered.

const TEXT = "Draw X cards. For each card drawn this way, discard a card unless you sacrifice a permanent.";

export default defineCard({
  name: "Read the Runes",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        upTo: { thisWay: "drawn" },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of permanents, up to one for each card drawn — discard a card for each you don't",
      },
      { kind: "discard", target: "you", amount: { difference: [{ thisWay: "drawn" }, { thisWay: "sacrificed" }] } },
    ],
  },
});
