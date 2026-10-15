import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 16780.

const ETB_TEXT = "When this creature enters, draw a card.";

export default defineCard({
  name: "Salt Road Packbeast",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 3,
  selfCostReduction: affinity({ type: "creature" }),
  text: `Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
