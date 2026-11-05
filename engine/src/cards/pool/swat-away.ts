import { defineCard } from "../define.js";

export default defineCard({
  name: "Swat Away",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: {
    condition: {
      kind: "controls",
      filter: { type: "creature", attackingYou: true },
      atLeast: 1,
      anyController: true,
    },
    reduceGeneric: 2,
  },
  text: "This spell costs {2} less to cast if a creature is attacking you.\nThe owner of target spell or creature puts it on their choice of the top or bottom of their library.",
  // "Target spell or creature": any spell, or a creature on the battlefield.
  targets: [{ kind: "spell-or-permanent", filter: { anyOf: [{ isSpell: true }, { type: "creature" }] } }],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
