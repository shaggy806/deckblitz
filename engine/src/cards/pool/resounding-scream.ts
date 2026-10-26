import { defineCard } from "../define.js";

// Rulings:
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve (because, for example, it has been countered, or all of its targets
//     have become illegal), the cycling ability will still resolve, and you'll draw a card.
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.

const CYCLE_TEXT = "When you cycle this card, target player discards two cards at random.";

export default defineCard({
  name: "Resounding Scream",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{5}{U}{B}{R}" },
  text: `Target player discards a card at random.\nCycling {5}{U}{B}{R} ({5}{U}{B}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1, random: true },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 2, random: true },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
