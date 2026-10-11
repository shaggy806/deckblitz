import { defineCard } from "../define.js";

// EDHREC rank 14155. Ghalta, Primal Hunger's reduction with the creatures
// narrowed to fliers: only the generic part comes off, {U}{U} is always paid
// (the ruling; rule 601.2f), and the total is locked in as the cost is
// determined, before mana abilities are activated (the rulings).

export default defineCard({
  name: "The Lord of the Eagles",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Noble"],
  power: 8,
  toughness: 8,
  keywords: ["flash", "flying"],
  text:
    "Flash\n" +
    "This spell costs {X} less to cast, where X is the total power of creatures you control with flying.\n" +
    "Flying",
  selfCostReduction: {
    // Unconditional: the same always-true gate Ghalta uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      aggregate: "sum",
      of: "power",
      filter: { type: "creature", controlledBy: "you", keyword: "flying" },
    },
  },
});
