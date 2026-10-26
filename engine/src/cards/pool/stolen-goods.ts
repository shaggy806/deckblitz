import { defineCard } from "../define.js";

// Rulings:
//   [2012-05-01] If there are no nonland cards left in that library, the opponent will exile all
//     cards from their library, and Stolen Goods will finish resolving.
//   [2012-05-01] If you can't cast the nonland card or if you choose not to cast it, it will
//     remain exiled.
//   [2012-05-01] If the card has {X} in its mana cost, you must choose 0 as its value.
//   [2012-05-01] You must follow the normal timing restrictions of the exiled card.
//   [2012-05-01] You cast the card from exile. Each land card exiled this way will remain exiled.
//
// `allow-cast-from-exile` gives the permission for the rest of the turn, at the
// card's own timing, rather than a cast during resolution.

export default defineCard({
  name: "Stolen Goods",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target opponent exiles cards from the top of their library until they exile a nonland card. Until end of turn, you may cast that card without paying its mana cost.",
  targets: ["opponent"],
  effect: {
    kind: "reveal-until",
    whose: 0,
    filter: { notTypes: ["land"] },
    exile: true,
    then: { kind: "allow-cast-from-exile", target: 0, free: true },
    rest: "stay",
  },
});
