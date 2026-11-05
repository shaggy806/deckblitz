import { defineCard } from "../define.js";

// EDHREC rank 4447.

const TRIGGER_TEXT =
  "At the beginning of your upkeep, exile the top two cards of your library. You may play those cards this turn.";

export default defineCard({
  name: "Wild Wasteland",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `Skip your draw step.\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
