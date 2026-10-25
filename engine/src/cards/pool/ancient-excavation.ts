import { defineCard } from "../define.js";

// EDHREC rank 9366.
//
// The hand is counted as the spell resolves, so the spell itself isn't in it
// (the ruling); the discard reads the cards actually drawn (`thisWay:
// "drawn"`), which a replaced draw makes fewer (the other ruling).

export default defineCard({
  name: "Ancient Excavation",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Draw cards equal to the number of cards in your hand, then discard a card for each card drawn this way.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { cardsInHand: "you" } },
      { kind: "discard", target: "you", amount: { thisWay: "drawn" } },
    ],
  },
});
