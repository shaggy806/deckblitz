import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 30525.
//
// Fading 4 (rule 702.32a) as its two parts: an "enters with" replacement and
// Cocoon's upkeep trigger — "if you can't" is no fade counter left to remove.
// The tap ability spends the same counters (Prism Array's `removeCounter`).

const FADING = "Fading 4";
const FADING_UPKEEP =
  "At the beginning of your upkeep, remove a fade counter from this creature. If you can't, sacrifice it.";
const TAP = "Remove a fade counter from this creature: Tap target creature.";

export default defineCard({
  name: "Jolting Merfolk",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 2,
  text: `Fading 4 (This creature enters with four fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\n${TAP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 4 } },
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
      cost: { mana: null, tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP,
    },
  ],
});
