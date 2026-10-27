import { defineCard } from "../define.js";

// EDHREC rank 31680. Fading 4 (rule 702.32) as its two pieces: the
// enters-with-counters replacement and Cocoon's upkeep remove-or-sacrifice.

const FADING = "Fading 4";
const UPKEEP = "At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.";
const PREVENT = "Remove a fade counter from this creature: Prevent the next 2 damage that would be dealt to any target this turn.";

export default defineCard({
  name: "Defender en-Vec",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  text: "Fading 4 (This creature enters with four fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\nRemove a fade counter from this creature: Prevent the next 2 damage that would be dealt to any target this turn.",
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
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: PREVENT,
    },
  ],
});
