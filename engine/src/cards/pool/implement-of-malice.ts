import { defineCard } from "../define.js";

// EDHREC rank 22985. Sacrificed to its own ability, the draw trigger resolves
// first, above the discard (the rulings).

const SAC = "{B}, Sacrifice this artifact: Target player discards a card. Activate only as a sorcery.";
const DRAW = "When this artifact is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Implement of Malice",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${SAC}\n${DRAW}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: SAC,
      sorcerySpeed: true,
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
