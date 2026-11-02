import { defineCard } from "../define.js";

// Rule 103.6b for the reveal, rule 119.5 for the life total: 26 from any total,
// up or down, so at a Commander table's 40 the reveal costs 14 life.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, at the beginning of the first upkeep, your life total becomes 26.";

export default defineCard({
  name: "Providence",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${REVEAL}\nYour life total becomes 26.`,
  effect: { kind: "set-life-total", who: "you", amount: 26 },
  targets: [],
  openingHandReveal: {
    at: "next-upkeep",
    effect: { kind: "set-life-total", who: "you", amount: 26 },
    text: REVEAL,
  },
});
