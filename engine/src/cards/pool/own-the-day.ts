import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Relentless Assault's effect behind a battlefront
// cost reduction, read as the spell is cast.

const COST_TEXT = "Battlefront — This spell costs {1} less to cast for each opponent you attacked this turn.";

export default defineCard({
  name: "Own the Day",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${COST_TEXT}\nUntap all creatures that attacked this turn. After this main phase, there is an additional combat phase followed by an additional main phase.`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "opponents-attacked", who: "you" },
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", attackedThisTurn: true } },
      { kind: "additional-combat" },
    ],
  },
});
