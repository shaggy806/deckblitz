import { defineCard } from "../define.js";

// EDHREC rank 9081.
// A creature loses the +0/+1 as it turns face up, and dies if its damage is
// then lethal (the ruling): the static reads `faceDown` continuously.
const PUMP_TEXT = "Face-down creatures you control get +0/+1.";
const DRAW_TEXT = "Whenever a permanent you control is turned face up, draw a card.";

export default defineCard({
  name: "Secret Plans",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  text: `${PUMP_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", faceDown: true } },
      grantPt: [0, 1],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
