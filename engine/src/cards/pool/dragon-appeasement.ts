import { defineCard } from "../define.js";

// EDHREC rank 26976.

export default defineCard({
  name: "Dragon Appeasement",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["enchantment"],
  text: "Skip your draw step.\nWhenever you sacrifice a creature, you may draw a card.",
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever you sacrifice a creature, you may draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
  ],
});
