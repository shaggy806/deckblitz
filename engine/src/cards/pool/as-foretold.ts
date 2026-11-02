import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, put a time counter on this enchantment.";
const COST_TEXT =
  "Once each turn, you may pay {0} rather than pay the mana cost for a spell you cast with mana value X or less, where X is the number of time counters on this enchantment.";

export default defineCard({
  name: "As Foretold",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        oncePerTurn: true,
        filter: { manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: "time" } } } },
      },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
