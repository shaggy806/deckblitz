import { defineCard } from "../define.js";

// EDHREC rank 18348. Sacrificed to its own ability, the draw trigger resolves
// first, above the counter (the rulings).

const SAC = "{G}, Sacrifice this artifact: Put a +1/+1 counter on target creature. Activate only as a sorcery.";
const DRAW = "When this artifact is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Implement of Ferocity",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${SAC}\n${DRAW}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
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
