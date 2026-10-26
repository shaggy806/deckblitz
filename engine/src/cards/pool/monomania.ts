import { defineCard } from "../define.js";

// EDHREC rank 23383.
//
// Rulings:
//   [2011-09-22] If there are one or zero cards in the player's hand, they will discard no cards.
//
// Choosing the one card to keep is choosing which all-but-one to discard: the
// target player discards their hand size minus one (never below 0), choosing
// which, as the hand stands when it resolves.

const TEXT = "Target player chooses a card in their hand and discards the rest.";

export default defineCard({
  name: "Monomania",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: { difference: [{ cardsInHand: "each" }, 1] } },
});
