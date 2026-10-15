import { defineCard } from "../define.js";

// EDHREC rank 16338.
//
// Rulings:
//   [2025-09-19] If a card in a graveyard has {X} in its mana cost, X is 0 when determining its
//     mana value.

const ETB_TEXT = "When this creature enters, choose one —";
const PUFF_PIECE = "Puff Piece — Put a +1/+1 counter on each of up to two target creatures.";
const JOURNALISM =
  "Investigative Journalism — Return target creature card with mana value 2 or less from your graveyard to your hand.";

export default defineCard({
  name: "Daily Bugle Reporters",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n• ${PUFF_PIECE}\n• ${JOURNALISM}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUFF_PIECE,
            targets: [
              { kind: "optional", of: "creature" },
              { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
            ],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
              ],
            },
          },
          {
            text: JOURNALISM,
            targets: [
              {
                kind: "card-in-graveyard",
                whose: "you",
                filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
              },
            ],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
