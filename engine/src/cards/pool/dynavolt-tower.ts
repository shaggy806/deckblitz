import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 16214. The cast trigger resolves before the spell
// (the ruling).
const CAST_TEXT = "Whenever you cast an instant or sorcery spell, you get {E}{E} (two energy counters).";
const SHOOT_TEXT = "{T}, Pay {E}{E}{E}{E}{E}: This artifact deals 3 damage to any target.";

export default defineCard({
  name: "Dynavolt Tower",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CAST_TEXT}\n${SHOOT_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 5 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: SHOOT_TEXT,
    },
  ],
});
