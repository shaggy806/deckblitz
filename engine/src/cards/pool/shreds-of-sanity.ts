import { defineCard } from "../define.js";

// EDHREC rank 15450.
//
// Rulings:
//   [2016-07-13] If you target two cards and one of the targeted cards becomes illegal, you’ll
//     still return the other one, discard a card, and exile Shreds of Sanity. If each targeted
//     card becomes illegal, Shreds of Sanity doesn’t resolve and you won’t discard a card or exile
//     Shreds of Sanity.
//   [2016-07-13] You may discard one of the cards you return to your hand. If you have no other
//     cards in hand, you must discard one of the cards you return to your hand.
//   [2016-07-13] You may cast Shreds of Sanity with just one target. You may also cast it without
//     any targets if you just want to discard a card.
//
// Reconstruct History's two slots and Macabre Waltz's discard after the
// return; no card is both an instant and a sorcery, so the slots can't share
// one. The spell exiles itself as it resolves.
const upToOne = (type: "instant" | "sorcery") =>
  ({ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type } } }) as const;

export default defineCard({
  name: "Shreds of Sanity",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Return up to one target instant card and up to one target sorcery card from your graveyard to your hand, then discard a card. Exile Shreds of Sanity.",
  targets: [upToOne("instant"), upToOne("sorcery")],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
  exileOnResolve: true,
});
