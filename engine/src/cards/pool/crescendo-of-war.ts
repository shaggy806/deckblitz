import { defineCard } from "../define.js";

// EDHREC rank 13876. Every attacking creature gets the bonus, whoever
// controls it; only your own blockers do.
const UPKEEP = "At the beginning of each upkeep, put a strife counter on this enchantment.";
const ATTACKING = "Attacking creatures get +1/+0 for each strife counter on this enchantment.";
const BLOCKING = "Blocking creatures you control get +1/+0 for each strife counter on this enchantment.";

export default defineCard({
  name: "Crescendo of War",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${ATTACKING}\n${BLOCKING}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "strife", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true } },
      grantPtPerCount: { countersOnSource: "strife", pt: [1, 0] },
      text: ATTACKING,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", blocking: true, controlledBy: "you" } },
      grantPtPerCount: { countersOnSource: "strife", pt: [1, 0] },
      text: BLOCKING,
    },
  ],
});
