import { defineCard } from "../define.js";

export default defineCard({
  name: "Gargantuan Leech",
  manaCost: "{7}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 5,
  toughness: 5,
  keywords: ["lifelink"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { sum: [{  countOf: { subtype: "Cave", controlledBy: "you" }  }, { countInGraveyard: { ownedBy: "you", subtype: "Cave" } }] },
  },
  text: "This spell costs {1} less to cast for each Cave you control and each Cave card in your graveyard.\nLifelink",
});
