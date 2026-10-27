import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 29094.
//
// Browse's shape: reveal the top N (N the sacrificed creature's power as it
// last existed), take one into hand, then exile the N - 1 still on top.

const TEXT =
  "{3}, {T}, Sacrifice a creature: Reveal a number of cards from the top of your library equal to the sacrificed creature's power. Put one into your hand and exile the rest.";

export default defineCard({
  name: "Eye of Yawgmoth",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: { powerOf: "sacrificed" },
            reveal: true,
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
          },
          { kind: "exile-from-library", amount: { difference: [{ powerOf: "sacrificed" }, 1] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
