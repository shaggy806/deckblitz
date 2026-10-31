import { defineCard } from "../define.js";

// The Islands counted as blockers are declared (rule 509.1b).
const EVASION = "Creatures with power less than the number of Islands you control can't block this creature.";

export default defineCard({
  name: "Kraken of the Straits",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 6,
  toughness: 6,
  text: EVASION,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { countOf: { subtype: "Island", controlledBy: "you" } } } } },
      text: EVASION,
    },
  ],
});
