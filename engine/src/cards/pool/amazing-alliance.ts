import { defineCard } from "../define.js";

// EDHREC rank 11455. "That much" is how many legendary creatures attacked: the
// trigger's batch (Vrestin's "trigger-batch"), each counted as it last was if
// it has left since.

const ANTHEM_TEXT = "Creatures you control get +1/+1.";
const ATTACK_TEXT = "Whenever you attack with one or more legendary creatures, you gain that much life.";

export default defineCard({
  name: "Amazing Alliance",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: ANTHEM_TEXT }],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { type: "creature", supertype: "legendary" } },
      targets: [],
      effect: { kind: "gain-life", amount: { aggregate: "count", filter: {}, in: "trigger-batch" } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
