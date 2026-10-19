import { defineCard } from "../define.js";

// EDHREC rank 7667.
//
// Rulings:
//   [2022-10-14] If one or more static abilities that apply to a creature entering the
//     battlefield change its power or toughness, those abilities are considered when determining
//     whether or not Symmetry Matrix's ability triggers. The same is true for replacement effects
//     that apply to it, such as entering the battlefield with one or more +1/+1 counters or
//     entering the battlefield as a copy of another creature.
//
// Mentor of the Meek's pay-{1} draw. "Power equal to its toughness" is the
// `{ own: "toughness" }` operand, read off the creature as it is on the
// battlefield — statics, counters it entered with and a copy all counted.

const TEXT =
  "Whenever a creature you control with power equal to its toughness enters, you may pay {1}. If you do, draw a card.";

export default defineCard({
  name: "Symmetry Matrix",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "eq", n: { own: "toughness" } } },
      },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to draw a card?", cost: "{1}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
