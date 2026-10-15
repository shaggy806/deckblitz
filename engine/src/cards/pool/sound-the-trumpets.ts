import { defineCard } from "../define.js";

// EDHREC rank 18577.
// Makes Human Soldier → use "Human Soldier Token".
//
// Rulings:
//   [2026-06-29] Once a spell or ability that causes you to recruit begins to resolve, no player
//     may take any other actions until it's done. Any responses made to the spell or ability must
//     be made before you draw, discard, and potentially create a token.

export default defineCard({
  name: "Sound the Trumpets",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If that spell's mana value was 2 or less, recruit. (Draw a card, then discard a card. If you discarded a nonland card, create a 1/1 white Human Soldier creature token.)",
  targets: ["spell"],
  // "Was": the mana value it had on the stack ({X} counted), read before it's countered — a
  // countered card's mana value in the graveyard drops its X.
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "counter", target: 0 },
        { kind: "draw", amount: 1 },
        { kind: "discard", target: "you", amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
          then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
        },
      ],
    },
    else: { kind: "counter", target: 0 },
  },
});
