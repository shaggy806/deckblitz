import { defineCard } from "../define.js";

// EDHREC rank 30116.
//
// "If you've sacrificed a permanent this turn" reads the caster's turn
// history: any permanent they sacrificed, a token or a cost included.

export default defineCard({
  name: "Count Nefaria",
  manaCost: "{6}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "This spell costs {3} less to cast if you've sacrificed a permanent this turn.\nFlying",
  selfCostReduction: {
    condition: { kind: "turn-history", what: "sacrificed" },
    reduceGeneric: 3,
  },
});
