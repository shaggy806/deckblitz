import { defineCard } from "../define.js";

// EDHREC rank 16924.
//
// Rulings:
//   [2004-10-04] You draw two cards and discard two cards all while Cephalid Broker’s ability is
//     resolving. Nothing can happen between the two, and no player may choose to take actions.

export default defineCard({
  name: "Cephalid Broker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 2,
  toughness: 2,
  text: "{T}: Target player draws two cards, then discards two cards.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2, target: 0 },
          { kind: "discard", target: 0, amount: 2 },
        ],
      },
      resolve: null,
      text: "{T}: Target player draws two cards, then discards two cards.",
    },
  ],
});
