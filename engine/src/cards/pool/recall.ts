import { defineCard } from "../define.js";

// Legends. EDHREC rank 14306.
//
// Rulings:
//   You don't choose which cards in your graveyard you'll return to your hand until after you
//   discard cards. You choose a card in your graveyard for each card you discarded, then you
//   put all cards chosen this way into your hand at the same time. You may choose to return
//   some or all of the cards you just discarded.
//   You don't discard cards until Recall resolves. If you don't have X cards in your hand at
//   that time, you discard all the cards in your hand.
//
// The return is one choice of exactly as many graveyard cards as were
// discarded (fewer only if the graveyard has fewer), the discarded ones among
// them, moved together.
export default defineCard({
  name: "Recall",
  manaCost: "{X}{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Discard X cards, then return a card from your graveyard to your hand for each card discarded this way. Exile Recall.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: "x" },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: { thisWay: "discarded", who: "you" },
        max: { thisWay: "discarded", who: "you" },
        destination: "hand",
        leftover: "stay",
      },
    ],
  },
  exileOnResolve: true,
});
