import { defineCard } from "../define.js";

// Ruling: with any creature on the battlefield the counter must move (the
// target is mandatory); with none, the trigger has no target and does nothing.
const ENTERS = "This enchantment enters with three +1/+1 counters on it.";
const MOVE = "At the beginning of your upkeep, move a +1/+1 counter from this enchantment onto target creature.";
const NONE = "When this enchantment has no +1/+1 counters on it, sacrifice it.";

export default defineCard({
  name: "Afiya Grove",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTERS}\n${MOVE}\n${NONE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature"],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1" },
      resolve: null,
      text: MOVE,
    },
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: NONE,
    },
  ],
});
