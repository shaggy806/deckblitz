import { defineCard } from "../define.js";

// Commander Legends: Battle for Baldur's Gate.
//
// The opponents its caster is attacking as the cost is determined (601.2f): only in their own
// combat, the players, not their planeswalkers or battles (`{ opponentsBeingAttacked }`).
// Generic mana only, so never below {W}.

export default defineCard({
  name: "Astral Confrontation",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {1} less to cast for each opponent you're attacking.\nExile target creature.",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponentsBeingAttacked: true },
  },
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature" } }],
  effect: { kind: "exile", target: 0 },
});
