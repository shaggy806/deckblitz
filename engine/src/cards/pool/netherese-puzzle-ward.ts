import { defineCard } from "../define.js";

const FOCUS_TEXT = "Focus Beam — At the beginning of your upkeep, roll a d4. Scry X, where X is the result.";
const PERFECT_TEXT = "Perfect Illumination — Whenever you roll a die's highest natural result, draw a card.";

export default defineCard({
  name: "Netherese Puzzle-Ward",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${FOCUS_TEXT}\n${PERFECT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "roll-dice", sides: 4, then: { kind: "scry", amount: { roll: "total" } } },
      resolve: null,
      text: FOCUS_TEXT,
    },
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { natural: "highest" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: PERFECT_TEXT,
    },
  ],
});
