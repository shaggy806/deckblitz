import { defineCard } from "../define.js";

// EDHREC rank 15897. Rapid Rescue's mill-and-take.
//
// Rulings:
//   [2022-10-14] If a replacement effect causes the milled cards to be exiled instead of going to
//     the graveyard, this effect can still apply to the cards "milled this way" in exile — the
//     `thisWay: "milled"` choice finds them in any public zone (rule 701.17c).

export default defineCard({
  name: "Wasteful Harvest",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Mill five cards. You may put a permanent card from among the cards milled this way into your hand. (To mill a card, put the top card of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 5 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: {
          thisWay: "milled",
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
        },
      },
    ],
  },
});
