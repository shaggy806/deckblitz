import { defineCard } from "../define.js";

// EDHREC rank 11848.
//
// Ainok Wayfarer's shape: "if you don't" is the `may`'s `else`, and with no milled land card
// there is nothing to put into your hand, so you don't. The gate asks what was milled this way
// wherever it went (a `this-way` condition, not the graveyard): a milled card a replacement
// exiled instead (Rest in Peace) is still found in exile (rule 701.17c), as the choice sees it.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put a land card from among the cards milled this way into your hand. If you don't, put a +1/+1 counter on this creature.";
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Blanchwood Prowler",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { type: "land" }, atLeast: 1 },
            then: {
              kind: "may",
              prompt: "Put a land card from among the milled cards into your hand?",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
                filter: { thisWay: "milled", type: "land" },
              },
              else: COUNTER,
            },
            else: COUNTER,
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
