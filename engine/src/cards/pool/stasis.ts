import { defineCard } from "../define.js";

// EDHREC rank 7845.
//
// Rulings:
//   [2004-10-04] Since there is no untap step, Phasing in/out won't happen.
//   [2004-10-04] Does not prevent cards from being untapped outside the untap step.

const SKIP_TEXT = "Players skip their untap steps.";
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {U}.";

export default defineCard({
  name: "Stasis",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${SKIP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, skipsSteps: { who: "each-player", steps: ["untap"] }, text: SKIP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{U}", text: "Pay {U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
