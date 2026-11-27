import { defineCard } from "../define.js";

// EDHREC rank 25937. Each block is its own trigger, once per pair (rule
// 509.3c, 509.3b): "becomes blocked by" is `blocked-by` (the blocker the
// trigger object, the attacker's `filter` comparing against it), "blocks" is
// `blocks` with `object: "blocked"` (the attacker the trigger object, the
// blocker's `filter` comparing against it). The powers are compared as the
// block is declared, part of the trigger event; the creature destroyed is
// the trigger object, only while it's still that creature (rule 400.7).

const BLOCKED_TEXT = "Whenever a creature becomes blocked by a creature with lesser power, destroy the blocking creature.";
const BLOCKS_TEXT = "Whenever a creature blocks a creature with lesser power, destroy the attacking creature.";
const GREATER_THAN_IT = { power: { op: "gt", n: { amount: { powerOf: "trigger-object" } } } } as const;

export default defineCard({
  name: "No Quarter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${BLOCKED_TEXT}\n${BLOCKS_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "any", filter: GREATER_THAN_IT },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: BLOCKED_TEXT,
    },
    {
      trigger: { on: "blocks", who: "any", object: "blocked", filter: GREATER_THAN_IT },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: BLOCKS_TEXT,
    },
  ],
});
