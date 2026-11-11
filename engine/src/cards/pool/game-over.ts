import { defineCard } from "../define.js";

export default defineCard({
  name: "Game Over",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if a player's life total is less than or equal to half their starting life total.\nDestroy all creatures.",
  // "A player": you or any opponent.
  selfCostReduction: {
    condition: {
      kind: "any",
      of: [
        { kind: "life-total", who: "you", atMost: "half-starting" },
        { kind: "life-total", who: "opponent", atMost: "half-starting" },
      ],
    },
    reduceGeneric: 2,
  },
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature" } },
});
