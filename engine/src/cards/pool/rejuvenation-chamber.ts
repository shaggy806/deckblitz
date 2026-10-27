import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 31321.
//
// Fading 2 (rule 702.32a) as its two parts: an "enters with" replacement and
// Cocoon's upkeep trigger — "if you can't" is no fade counter left to remove.

const FADING = "Fading 2";
const FADING_UPKEEP =
  "At the beginning of your upkeep, remove a fade counter from this artifact. If you can't, sacrifice it.";

export default defineCard({
  name: "Rejuvenation Chamber",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Fading 2 (This artifact enters with two fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\n{T}: You gain 2 life.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 2 } },
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
      text: FADING_UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "{T}: You gain 2 life.",
    },
  ],
});
