import { defineCard } from "../define.js";

// EDHREC rank 32510.
//
// Any land card in the graveyard will do, not only a milled one; with none
// there, the Treasure (Roots of Wisdom's shape).

const ETB_TEXT =
  "When this creature enters, mill three cards. Then return a land card from your graveyard to your hand. If you can't, create a Treasure token.";

export default defineCard({
  name: "Temporal Conqueror",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Na'kuhl", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT} (To mill three cards, put the top three cards from your library into your graveyard.)`,
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
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "land" } },
            then: {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "stay",
              filter: { type: "land" },
            },
            else: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
