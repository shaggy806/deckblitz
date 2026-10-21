import { defineCard } from "../define.js";

// Geyser Drake's static, word for word.
const COST_TEXT = "During turns other than yours, spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Naiad of Hidden Coves",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 3,
  text: COST_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      costModification: { applies: {}, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
});
