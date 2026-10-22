import { defineCard } from "../define.js";

// Aether Revolt. The second ability triggers however it reaches the graveyard,
// its own sacrifice included — then drawing before the first ability resolves
// (its rulings).
const SAC_TEXT = "{U}, Sacrifice this artifact: Draw a card.";
const DIES_TEXT = "When this artifact is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Implement of Examination",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${SAC_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
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
      text: DIES_TEXT,
    },
  ],
});
