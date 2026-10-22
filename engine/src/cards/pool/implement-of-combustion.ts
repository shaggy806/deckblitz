import { defineCard } from "../define.js";

// EDHREC rank 11063.
//
// Rulings:
//   [2017-02-09] An Implement's last ability triggers no matter why it's put into a graveyard from
//     the battlefield. You don't have to activate its first ability.
//   [2017-02-09] If you activate an Implement's first ability, you'll draw a card from its second
//     ability before the first ability resolves.

const SAC_TEXT = "{R}, Sacrifice this artifact: It deals 1 damage to target player or planeswalker.";
const DRAW_TEXT = "When this artifact is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Implement of Combustion",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${SAC_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
