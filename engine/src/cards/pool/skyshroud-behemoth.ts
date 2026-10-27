import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 30901.
//
// Fading 2 (rule 702.32a) as its two parts: an "enters with" replacement and
// Cocoon's upkeep trigger — "if you can't" is no fade counter left to remove.

const FADING = "Fading 2";
const FADING_UPKEEP =
  "At the beginning of your upkeep, remove a fade counter from this creature. If you can't, sacrifice it.";

export default defineCard({
  name: "Skyshroud Behemoth",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 10,
  toughness: 10,
  text: "Fading 2 (This creature enters with two fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\nThis creature enters tapped.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 2 } },
      text: FADING,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
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
});
