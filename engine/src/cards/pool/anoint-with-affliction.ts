import { defineCard } from "../define.js";

// EDHREC rank 11614.
//
// Corrupted reads the target's controller as it resolves: with three or more
// poison counters the creature is exiled whatever its mana value.

export default defineCard({
  name: "Anoint with Affliction",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature if it has mana value 3 or less.\nCorrupted — Exile that creature instead if its controller has three or more poison counters.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "any",
      of: [
        { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
        { kind: "player-counters", counter: "poison", who: { controllerOf: 0 }, atLeast: 3 },
      ],
    },
    then: { kind: "exile", target: 0 },
  },
});
