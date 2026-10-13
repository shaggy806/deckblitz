import { defineCard } from "../define.js";

// EDHREC rank 9626.
//
// The cost is worked out before the spell becomes cast (rule 601.2f, 601.2i),
// so any spell already counted this turn is "another" spell.

export default defineCard({
  name: "Focus the Mind",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if you've cast another spell this turn.\nDraw three cards, then discard a card.",
  selfCostReduction: {
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
    reduceGeneric: 2,
  },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
});
