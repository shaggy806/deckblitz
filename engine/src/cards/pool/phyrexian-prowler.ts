import { defineCard } from "../define.js";

// EDHREC rank 31381.
//
// Fading 3 (rule 702.32a) as its two parts: an enters-with-counters
// replacement, and the upkeep trigger that removes a fade counter or, with
// none to remove, sacrifices it (Cocoon's shape).

const FADING = "Fading 3";
const UPKEEP =
  "At the beginning of your upkeep, remove a fade counter from this creature. If you can't, sacrifice it.";
const PUMP = "Remove a fade counter from this creature: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Phyrexian Prowler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Mercenary"],
  power: 3,
  toughness: 3,
  text: `Fading 3 (This creature enters with three fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\n${PUMP}`,
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
      cost: { mana: null, tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
});
