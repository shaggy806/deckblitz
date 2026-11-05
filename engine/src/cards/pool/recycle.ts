import { defineCard } from "../define.js";

// A countered spell was still played (the ruling): it triggers on the cast.
const SKIP_TEXT = "Skip your draw step.";
const PLAY_TEXT = "Whenever you play a card, draw a card.";
const HAND_TEXT = "Your maximum hand size is two.";

export default defineCard({
  name: "Recycle",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${SKIP_TEXT}\n${PLAY_TEXT}\n${HAND_TEXT}`,
  static: [
    { affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: SKIP_TEXT },
    { affects: { scope: "self" }, maxHandSize: { who: "you", set: 2 }, text: HAND_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "plays-card", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: PLAY_TEXT,
    },
  ],
});
