import { defineCard } from "../define.js";

// EDHREC rank 8898. The shift is a modifier from another source (rule
// 706.2a), applied after the dice are seen and before anything reads them:
// "whenever you roll a 6" sees the shifted result. One die, either way, once
// each turn (its rulings).

const SHIFT =
  "After you roll a die, you may pay 1 life. If you do, increase or decrease the result by 1. Do this only once each turn.";
const SIX = "Whenever you roll a 6, create a 2/2 black Zombie Employee creature token.";

export default defineCard({
  name: "Night Shift of the Living Dead",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${SHIFT}\n${SIX}`,
  static: [
    {
      affects: { scope: "self" },
      shiftsRoll: { by: 1, payLife: 1, oncePerTurn: true },
      text: SHIFT,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 6, atMost: 6 } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Employee Token", count: 1 },
      resolve: null,
      text: SIX,
    },
  ],
});
