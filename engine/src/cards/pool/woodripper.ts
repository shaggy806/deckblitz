import { defineCard } from "../define.js";

// EDHREC rank 30708.
//
// Fading 3 (rule 702.32a) as its two parts: an enters-with-counters
// replacement, and the upkeep trigger that removes a fade counter or, with
// none to remove, sacrifices it (Cocoon's shape).

const FADING = "Fading 3";
const UPKEEP =
  "At the beginning of your upkeep, remove a fade counter from this creature. If you can't, sacrifice it.";
const DESTROY = "{1}, Remove a fade counter from this creature: Destroy target artifact.";

export default defineCard({
  name: "Woodripper",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 6,
  text: `Fading 3 (This creature enters with three fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\n${DESTROY}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 3 } },
      text: FADING,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY,
    },
  ],
});
