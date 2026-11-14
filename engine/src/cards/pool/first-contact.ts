import { defineCard } from "../define.js";

// Star Trek (TRK). "If this spell is the first spell you've cast this game"
// is asked on resolution (`first-spell-this-game` of the spell on the stack):
// it was cast, before any other of yours — a spell cast in response doesn't
// change it, and a copy was never cast (rule 707.10).

export default defineCard({
  name: "First Contact",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Mill four cards. You may put a permanent card from among them into your hand. If this spell is the first spell you've cast this game, you gain 2 life. (To mill four cards, put the top four cards of your library into your graveyard.)",
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
      {
        kind: "conditional",
        condition: { kind: "first-spell-this-game" },
        then: { kind: "gain-life", amount: 2 },
      },
    ],
  },
});
