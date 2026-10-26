import { defineCard } from "../define.js";

// EDHREC rank 18704.

const SAC_TEXT = "{T}, Sacrifice this artifact: Target creature can't block this turn.";
const DIES_TEXT = "When this artifact is put into a graveyard from the battlefield, you may pay {R}. If you do, draw a card.";

export default defineCard({
  name: "Panic Spellbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${SAC_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to draw a card?",
        cost: "{R}",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
