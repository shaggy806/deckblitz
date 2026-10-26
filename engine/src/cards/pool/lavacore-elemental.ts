import { defineCard } from "../define.js";

// EDHREC rank 27611.
//
// Rulings:
//   - If Lavacore Elemental deals combat damage to a player, it triggers its own ability.
//   - If multiple creatures you control deal combat damage to a player, Lavacore Elemental's
//     ability triggers that many times.

export default defineCard({
  name: "Lavacore Elemental",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 3,
  text: "Vanishing 1 (This creature enters with a time counter on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nWhenever a creature you control deals combat damage to a player, put a time counter on this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, if this permanent has a time counter on it, remove a time counter from it.",
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When the last time counter is removed from this permanent, sacrifice it.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control deals combat damage to a player, put a time counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "time", amount: 1 } },
      text: "Vanishing 1 (This permanent enters with a time counter on it.)",
    },
  ],
});
