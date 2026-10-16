import { defineCard } from "../define.js";

// EDHREC rank 8647.
//
// Generic mana only, and the spells' mana values don't change (the rulings):
// a `costModification` reduction, on while it isn't its controller's turn.
const COST_TEXT = "During turns other than yours, spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Geyser Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      costModification: { applies: {}, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
});
