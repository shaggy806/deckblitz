import { defineCard } from "../define.js";

// EDHREC rank 23563.
//
// Oko, Shadowmoor Scion's −1 shape: the choice is among the cards milled by
// this resolution only, and the life is gained whether or not one is taken.

export default defineCard({
  name: "Something Worth Saving",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Mill four cards. You may put a permanent card from among them into your hand. You gain 1 life. (To mill four cards, put the top four cards of your library into your graveyard.)",
  targets: [],
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
      { kind: "gain-life", amount: 1 },
    ],
  },
});
