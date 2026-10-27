import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 21189.

const UNTAP_TEXT = "Nonland permanents don't untap during their controllers' untap steps.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you lose 2 life.";

export default defineCard({
  name: "Embargo",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { notTypes: ["land"] } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
