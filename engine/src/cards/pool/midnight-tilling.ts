import { defineCard } from "../define.js";

// EDHREC rank 8527.

export default defineCard({
  name: "Midnight Tilling",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Mill four cards, then you may return a permanent card from among them to your hand. (To mill four cards, put the top four cards of your library into your graveyard.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
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
