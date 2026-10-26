import { defineCard } from "../define.js";

// Rulings:
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve (because, for example, it has been countered, or all of its targets
//     have become illegal), the cycling ability will still resolve, and you'll draw a card.
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.

const CYCLE_TEXT = "When you cycle this card, return two target permanents to their owners' hands.";

export default defineCard({
  name: "Resounding Wave",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{5}{W}{U}{B}" },
  text: `Return target permanent to its owner's hand.\nCycling {5}{W}{U}{B} ({5}{W}{U}{B}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["permanent", { kind: "other", of: "permanent", than: { slot: 0 } }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
