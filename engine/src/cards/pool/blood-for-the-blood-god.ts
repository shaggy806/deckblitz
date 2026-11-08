import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood for the Blood God!",
  manaCost: "{8}{B}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "This spell costs {1} less to cast for each creature that died this turn.\nDiscard your hand, then draw eight cards. Blood for the Blood God! deals 8 damage to each opponent. Exile Blood for the Blood God!",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnHistory: "died", who: "each-player", filter: { type: "creature" } },
  },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: 8 },
      { kind: "damage", amount: 8, who: "each-opponent" },
    ],
  },
  exileOnResolve: true,
});
