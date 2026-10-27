import { defineCard } from "../define.js";

// EDHREC rank 31753.
//
// Fading 2 (rule 702.32a) is its two pieces: the enters-with-counters
// replacement and the upkeep trigger, whose "if you can't" is read as it
// resolves.

export default defineCard({
  name: "Skyshroud Ridgeback",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 3,
  text: "Fading 2 (This creature enters with two fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 2 } },
      text: "Fading 2",
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
      text: "At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.",
    },
  ],
});
