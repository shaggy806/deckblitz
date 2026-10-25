import { defineCard } from "../define.js";

// Homelands. EDHREC rank 17685.
// The upkeep trigger is an intervening-if (rule 603.4): it checks for no
// arrowhead counters as upkeep begins and again as it resolves (the ruling).
export default defineCard({
  name: "Serrated Arrows",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three arrowhead counters on it.\nAt the beginning of your upkeep, if there are no arrowhead counters on this artifact, sacrifice it.\n{T}, Remove an arrowhead counter from this artifact: Put a -1/-1 counter on target creature.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "arrowhead", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "{T}, Remove an arrowhead counter from this artifact: Put a -1/-1 counter on target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "arrowhead", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of your upkeep, if there are no arrowhead counters on this artifact, sacrifice it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "arrowhead", amount: 3 } },
      text: "This artifact enters with three arrowhead counters on it.",
    },
  ],
});
