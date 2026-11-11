import { defineCard } from "../define.js";

// EDHREC rank 6794. The token copies what's printed on Jace, but for two
// exceptions, both copiable (rule 707.9b; the rulings): it isn't legendary, and
// its starting loyalty is 1, so it enters with one loyalty counter — as would
// anything that entered as a copy of it. A copy isn't kicked, so the token
// makes no token of its own.
//
// The 0 ability reads the card actually drawn: a replaced draw reveals nothing
// and removes nothing (the ruling). More counters than he has removes them all.

const KICKED_TEXT =
  "When Jace enters, if Jace was kicked, create a token that's a copy of Jace, except it's not legendary and its starting loyalty is 1.";
const PLUS = "+1: Scry 2.";
const ZERO = "0: Draw a card and reveal it. Remove a number of loyalty counters equal to that card's mana value from Jace.";

export default defineCard({
  name: "Jace, Mirror Mage",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 4,
  text: `Kicker {2}\n${KICKED_TEXT}\n${PLUS}\n${ZERO}`,
  kicker: { cost: "{2}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "source",
        count: 1,
        who: "you",
        exceptions: { removeSupertypes: ["legendary"], loyalty: 1 },
      },
      resolve: null,
      text: KICKED_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "reveal-drawn" },
          { kind: "remove-counter", target: "source", counter: "loyalty", amount: { manaValueOf: { thisWay: "drawn" } } },
        ],
      },
      resolve: null,
      text: ZERO,
    },
  ],
});
