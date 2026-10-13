import { defineCard } from "../define.js";

// EDHREC rank 11923.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put a land card from among them into your hand. If you don't, put a +1/+1 counter on this creature.";
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Ainok Wayfarer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Scout"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT} (To mill three cards, put the top three cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // "If you don't" is the `may`'s `else`; with no milled land card in
      // the graveyard there is nothing to put into your hand, so you don't.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { thisWay: "milled", type: "land" } },
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
