import { defineCard } from "../define.js";

// EDHREC rank 15281. Each player reveals the top card of their library (rule
// 701.20a), all of them before the rest; the cards stay on top (the ruling).
// "For each creature card revealed this way" is a token copy of each one
// (`of: { thisWay: "revealed" }`, `ofMatching`), created by the spell's
// controller, with the copy exceptions (rule 707.9b). "Return Haunting
// Imitation to its owner's hand" is the spell itself, from the stack.
//
// Rulings:
//   - The revealed cards stay on the top of their owners' libraries.

const TEXT =
  "Each player reveals the top card of their library. For each creature card revealed this way, create a token that's a copy of that card, except it's 1/1, it's a Spirit in addition to its other types, and it has flying. If no creature cards were revealed this way, return Haunting Imitation to its owner's hand.";

export default defineCard({
  name: "Haunting Imitation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "reveal-top",
    who: "each-player",
    then: {
      kind: "sequence",
      effects: [
        {
          kind: "create-token-copy",
          of: { thisWay: "revealed" },
          ofMatching: { type: "creature" },
          count: 1,
          who: "you",
          exceptions: { power: 1, toughness: 1, addSubtypes: ["Spirit"], keywords: ["flying"] },
        },
        {
          kind: "conditional",
          condition: { kind: "amounts", left: { thisWay: "revealed", filter: { type: "creature" } }, op: "eq", right: 0 },
          then: { kind: "return-to-hand", target: "source", from: "stack" },
        },
      ],
    },
  },
});
