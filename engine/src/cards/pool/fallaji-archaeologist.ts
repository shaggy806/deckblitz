import { defineCard } from "../define.js";

// EDHREC rank 17720. The Brothers' War.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put a noncreature, nonland card from among the cards milled this way into your hand. If you don't, put a +1/+1 counter on this creature.";
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;
const MILLED = { thisWay: "milled", notTypes: ["creature", "land"] } as const;

export default defineCard({
  name: "Fallaji Archaeologist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 0,
  toughness: 3,
  text: `${ETB_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Ainok Wayfarer's shape: "If you don't" is the `may`'s `else`; with no
      // milled noncreature, nonland card there is nothing to put into your
      // hand, so you don't.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: MILLED },
            then: {
              kind: "may",
              prompt: "Put a noncreature, nonland card from among the milled cards into your hand?",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
                filter: MILLED,
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
