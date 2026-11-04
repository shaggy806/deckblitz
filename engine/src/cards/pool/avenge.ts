import { defineCard } from "../define.js";

// EDHREC rank 15208.

export default defineCard({
  name: "Avenge",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if a player attacked you during their last turn.\nDestroy all creatures. You gain 1 life for each creature destroyed this way.",
  selfCostReduction: { condition: { kind: "attacked-you-last-turn" }, reduceGeneric: 2 },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      { kind: "gain-life", amount: { thisWay: "destroyed" } },
    ],
  },
});
