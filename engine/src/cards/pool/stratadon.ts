import { defineCard } from "../define.js";

// EDHREC rank 25526.

export default defineCard({
  name: "Stratadon",
  manaCost: "{10}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { basicLandTypes: "you" },
  },
  text: "Domain — This spell costs {1} less to cast for each basic land type among lands you control.\nTrample",
});
