import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 27379.
//
// The hand is discarded as part of the enters replacement (`asEnters`'s
// `discardHand`, rule 614.1c), before it's on the battlefield; the extra draw
// is a draw-step trigger, as Avaricious Dragon's is.

const ENTER_TEXT = "As this enchantment enters, discard your hand.";
const DRAW_TEXT = "At the beginning of your draw step, draw an additional card.";

export default defineCard({
  name: "Heightened Awareness",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", asEnters: { discardHand: true } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
