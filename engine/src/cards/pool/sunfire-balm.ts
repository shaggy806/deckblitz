import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31198.
//
// Rulings:
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve, the cycling ability will still resolve, and you'll draw a card.

const CYCLE_TEXT =
  "When you cycle this card, you may prevent the next 1 damage that would be dealt to any target this turn.";

export default defineCard({
  name: "Sunfire Balm",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{1}{W}" },
  text: `Prevent the next 4 damage that would be dealt to any target this turn.\nCycling {1}{W} ({1}{W}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "prevent-damage", target: 0, amount: 4 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Prevent the next 1 damage that would be dealt to the target this turn?",
        effect: { kind: "prevent-damage", target: 0, amount: 1 },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
