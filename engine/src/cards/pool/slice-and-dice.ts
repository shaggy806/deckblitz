import { defineCard } from "../define.js";

// EDHREC rank 14588. Deem Worthy's cycle trigger, over every creature.
//
// Rulings:
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve (because, for example, it has been countered, or all of its targets
//     have become illegal), the cycling ability will still resolve, and you'll draw a card.

const CYCLE_TEXT = "When you cycle this card, you may have it deal 1 damage to each creature.";

export default defineCard({
  name: "Slice and Dice",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cycling: { cost: "{2}{R}" },
  text: `Slice and Dice deals 4 damage to each creature.\nCycling {2}{R} ({2}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: [],
  effect: { kind: "damage-all", amount: 4, filter: { type: "creature" } },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Slice and Dice deal 1 damage to each creature?",
        effect: { kind: "damage-all", amount: 1, filter: { type: "creature" } },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
