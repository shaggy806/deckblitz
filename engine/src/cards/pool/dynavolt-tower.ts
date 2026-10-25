import { defineCard } from "../define.js";

// EDHREC rank 16214. The energy trigger resolves before the spell that
// caused it (the ruling).

export default defineCard({
  name: "Dynavolt Tower",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Whenever you cast an instant or sorcery spell, you get {E}{E} (two energy counters).\n{T}, Pay {E}{E}{E}{E}{E}: This artifact deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, you get {E}{E}.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 5 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "{T}, Pay {E}{E}{E}{E}{E}: This artifact deals 3 damage to any target.",
    },
  ],
});
