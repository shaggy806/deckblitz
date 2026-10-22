import { defineCard } from "../define.js";

// EDHREC rank 10379.
//
// Rulings:
//   [2017-02-09] If you activate an Implement's first ability, you'll draw a card from its second
//     ability before the first ability resolves.
//   [2017-02-09] An Implement's last ability triggers no matter why it's put into a graveyard from
//     the battlefield. You don't have to activate its first ability.

const SAC = "{W}, Sacrifice this artifact: You gain 2 life.";
const DRAW = "When this artifact is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Implement of Improvement",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${SAC}\n${DRAW}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
