import { defineCard } from "../define.js";

// EDHREC rank 8471.
//
// Rulings:
//   [2017-09-29] If your life total is 6 or greater as the second ability of Arguel's Blood Fast
//     tries to resolve, it won't do anything.
//   [2017-09-29] If your life total is 6 or greater as your upkeep begins, the second ability of
//     Arguel's Blood Fast won't trigger.
//
// "If you have 5 or less life" is an intervening-if (rule 603.4): checked as
// the upkeep begins and again as the ability resolves.

const DRAW_TEXT = "{1}{B}, Pay 2 life: Draw a card.";
const FLIP_TEXT = "At the beginning of your upkeep, if you have 5 or less life, you may transform Arguel's Blood Fast.";

export default defineCard({
  name: "Arguel's Blood Fast",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${DRAW_TEXT}\n${FLIP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "life-total", who: "you", atMost: 5 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Transform Arguel's Blood Fast?",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Arguel's Blood Fast", "Temple of Aclazotz"],
  transform: true,
});
