import { defineCard } from "../define.js";

// EDHREC rank 18773.
//
// One printed ability with two trigger conditions, as Up the Beanstalk's:
// its enters trigger and a cast trigger. The rummage is Discerning Peddler's
// "you may discard a card. If you do, draw a card" — not offered with an
// empty hand. A spell's {X} counts toward its mana value on the stack (the
// ruling — rule 202.3e).

const TEXT =
  "When this creature enters and whenever you cast a spell with mana value 4 or greater, you may discard a card. If you do, draw a card.";

const RUMMAGE = {
  kind: "may",
  prompt: "Discard a card to draw a card?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 1 },
      { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
    ],
  },
} as const;

export default defineCard({
  name: "Flaring Cinder",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: RUMMAGE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: RUMMAGE,
      resolve: null,
      text: TEXT,
    },
  ],
});
