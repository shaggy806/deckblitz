import { defineCard } from "../define.js";

// EDHREC rank 4815. "If your life total is less than your starting life total":
// the difference, never below 0 (rule 107.1b).

export default defineCard({
  name: "Shadow of Mortality",
  manaCost: "{13}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 7,
  toughness: 7,
  text: "If your life total is less than your starting life total, this spell costs {X} less to cast, where X is the difference.",
  selfCostReduction: {
    condition: { kind: "life-total", atMost: { startingPlus: -1 } },
    reduceGeneric: { difference: [{ startingLifeTotal: true }, { lifeTotal: "you" }] },
  },
});
