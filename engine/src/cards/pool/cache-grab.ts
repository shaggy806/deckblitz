import { defineCard } from "../define.js";

// Bloomburrow (BLB). "Returned a Squirrel card to your hand this way" is the
// `"put-into-hand"` this-way kind over a Squirrel — the milled card taken
// back, read in the hand it went to.

const TEXT =
  "Mill four cards. You may put a permanent card from among the cards milled this way into your hand. If you control a Squirrel or returned a Squirrel card to your hand this way, create a Food token. (To mill four cards, put the top four cards of your library into your graveyard. A Food token is an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Cache Grab",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
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
        condition: {
          kind: "any",
          of: [
            { kind: "controls", filter: { subtype: "Squirrel" }, atLeast: 1 },
            { kind: "this-way", what: "put-into-hand", filter: { subtype: "Squirrel" } },
          ],
        },
        then: { kind: "create-token", token: "Food Token", count: 1 },
      },
    ],
  },
});
