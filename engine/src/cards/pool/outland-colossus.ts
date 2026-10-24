import { defineCard } from "../define.js";

// EDHREC rank 20158.
//
// Rulings:
//   [2015-06-22] If a creature with renown deals combat damage to its controller because that
//     damage was redirected, renown will trigger.
//   [2015-06-22] If a renown ability triggers, but the creature leaves the battlefield before that
//     ability resolves, the creature doesn't become renowned. Any ability that triggers "whenever
//     a creature becomes renowned" won't trigger.
//   [2015-06-22] Renown won't trigger when a creature deals combat damage to a planeswalker or
//     another creature. It also won't trigger when a creature deals noncombat damage to a player.

export default defineCard({
  name: "Outland Colossus",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  text: "Renown 6 (When this creature deals combat damage to a player, if it isn't renowned, put six +1/+1 counters on it and it becomes renowned.)\nThis creature can't be blocked by more than one creature.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 6 },
      resolve: null,
      text: "Renown 6 (When this creature deals combat damage to a player, if it isn't renowned, put six +1/+1 counters on it and it becomes renowned.)",
    },
  ],
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: "This creature can't be blocked by more than one creature." }],
});
