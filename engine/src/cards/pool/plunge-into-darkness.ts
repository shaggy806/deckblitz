import { defineCard } from "../define.js";

// EDHREC rank 12697.
//
// Rulings: entwined, it's (1) sacrifice any number of creatures, (2) gain 3
// life for each, (3) choose X, (4) pay X life and (5) look at the top X cards,
// one into your hand and the rest exiled; everything but the mode and entwine
// choice is done on resolution. "Pay any amount of life" is the
// `players-pay-any-amount` of you alone (`who: "you"`): 0 is an amount
// (rules 107.1c, 119.4b), and no more than you can pay (119.4).

const YOUR_CREATURES = { type: "creature", controlledBy: "you" } as const;
const SACRIFICE = "Sacrifice any number of creatures. You gain 3 life for each creature sacrificed this way.";
const PAY =
  "Pay any amount of life, then look at that many cards from the top of your library. Put one of those cards into your hand and exile the rest.";

export default defineCard({
  name: "Plunge into Darkness",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: { cost: "{B}", keyword: "entwine" },
  text: `Choose one —\n• ${SACRIFICE}\n• ${PAY}\nEntwine {B} (Choose both if you pay the entwine cost.)`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SACRIFICE,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "choose-permanents",
              filter: YOUR_CREATURES,
              upTo: { countOf: YOUR_CREATURES },
              then: { kind: "sacrifice-target", target: 0 },
              prompt: "Sacrifice any number of creatures",
            },
            { kind: "gain-life", amount: { product: [3, { thisWay: "sacrificed" }] } },
          ],
        },
      },
      {
        text: PAY,
        targets: [],
        effect: {
          kind: "players-pay-any-amount",
          resource: "life",
          who: "you",
          then: {
            kind: "look-and-choose",
            zone: "library",
            count: "x",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "exile",
          },
        },
      },
    ],
    kickedModes: 2,
  },
});
