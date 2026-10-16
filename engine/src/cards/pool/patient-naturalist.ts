import { defineCard } from "../define.js";

// EDHREC rank 16118.

const TEXT =
  "When this creature enters, mill three cards. Put a land card from among the milled cards into your hand. If you can't, create a Treasure token.";

// "Put a land card" isn't optional: with a land card among the milled cards
// one goes to your hand, and only with none do you make a Treasure. The
// milled cards are found wherever they went (a Rest in Peace exile too —
// rule 701.17c), by the condition as by the choice.
const MILLED_LAND = { thisWay: "milled", type: "land" } as const;

export default defineCard({
  name: "Patient Naturalist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (To mill three cards, put the top three cards of your library into your graveyard.)`,
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
            condition: { kind: "this-way", what: "milled", filter: { type: "land" } },
            then: {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "stay",
              filter: MILLED_LAND,
            },
            else: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
