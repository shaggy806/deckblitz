import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 17222.
//
// Ghalta, Primal Hunger's reduction with the greatest power in place of the
// total: generic mana only, so {R} is always paid, and the mana value stays 8.
export default defineCard({
  name: "Molten Monstrosity",
  manaCost: "{7}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "This spell costs {X} less to cast, where X is the greatest power among creatures you control.\nTrample",
  selfCostReduction: {
    // Unconditional: the same always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      aggregate: "max",
      of: "power",
      filter: { type: "creature", controlledBy: "you" },
    },
  },
});
