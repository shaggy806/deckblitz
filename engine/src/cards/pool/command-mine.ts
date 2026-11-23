import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Command Tower's mana, one or — while its
// controller controls a Command Tower and a Command Power Plant (by name,
// rule 201.2) — two, each its own choice among the commander's colours
// (Urza's Tower's `ifCondition` amount).

const TEXT =
  "{T}: Add one mana of any color in your commander's color identity. If you control a Command Tower and a Command Power Plant, add two mana of any color in your commander's color identity instead.";

export default defineCard({
  name: "Command Mine",
  colors: [],
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "commander-identity",
        amount: {
          ifCondition: {
            kind: "all",
            of: [
              { kind: "controls", filter: { name: "Command Tower" }, atLeast: 1 },
              { kind: "controls", filter: { name: "Command Power Plant" }, atLeast: 1 },
            ],
          },
          then: 2,
          else: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
