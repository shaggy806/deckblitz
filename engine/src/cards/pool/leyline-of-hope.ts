import { defineCard } from "../define.js";

// EDHREC rank 3356.

const LIFE_TEXT = "If you would gain life, you gain that much life plus 1 instead.";
const PUMP_TEXT = "As long as you have at least 7 life more than your starting life total, creatures you control get +2/+2.";

export default defineCard({
  name: "Leyline of Hope",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `If this card is in your opening hand, you may begin the game with it on the battlefield.\n${LIFE_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", instead: { modify: { plus: 1 } } },
      text: LIFE_TEXT,
    },
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [2, 2],
      condition: { kind: "life-total", atLeast: { startingPlus: 7 } },
      text: PUMP_TEXT,
    },
  ],
});
