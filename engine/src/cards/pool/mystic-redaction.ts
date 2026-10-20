import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, scry 1.";
const DISCARD_TEXT =
  "Whenever you discard a card, each opponent mills two cards. (They put the top two cards of their library into their graveyard.)";

export default defineCard({
  name: "Mystic Redaction",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "mill", target: "each-opponent", amount: 2 },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
