import { defineCard } from "../define.js";

// Only the generic part of a cycling cost comes off: Cycling {W} stays {W},
// Cycling {2}{U} becomes {U} (rule 601.2f via 602.2b; typecycling is
// cycling too, 702.29e).

const TEXT = "Cycling abilities you activate cost {2} less to activate.";

export default defineCard({
  name: "Fluctuator",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "cycling", byYou: true, reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
