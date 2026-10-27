import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 31445.
//
// Fading 3 (rule 702.32a) as its two parts: an "enters with" replacement and
// Cocoon's upkeep trigger — "if you can't" is no fade counter left to remove.

const FADING = "Fading 3";
const FADING_UPKEEP =
  "At the beginning of your upkeep, remove a fade counter from this creature. If you can't, sacrifice it.";

export default defineCard({
  name: "Cloudskate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nFading 3 (This creature enters with three fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)",
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
      text: FADING_UPKEEP,
    },
  ],
});
