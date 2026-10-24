import { defineCard } from "../define.js";

// EDHREC rank 15735.
//
// Rulings:
//   [2015-06-22] If a renown ability triggers, but the creature leaves the battlefield before that
//     ability resolves, the creature doesn’t become renowned. Any ability that triggers “whenever
//     a creature becomes renowned” won’t trigger.
//   [2015-06-22] If a creature with renown deals combat damage to its controller because that
//     damage was redirected, renown will trigger.
//   [2015-06-22] Renown won’t trigger when a creature deals combat damage to a planeswalker or
//     another creature. It also won’t trigger when a creature deals noncombat damage to a player.

export default defineCard({
  name: "Scab-Clan Berserker",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nRenown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nWhenever an opponent casts a noncreature spell, if this creature is renowned, this creature deals 2 damage to that player.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 1 },
      resolve: null,
      text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
    },
    {
      trigger: { on: "cast-spell", who: "opponent", noncreatureOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: "Whenever an opponent casts a noncreature spell, if this creature is renowned, this creature deals 2 damage to that player.",
      condition: { kind: "source", filter: { renowned: true } },
    },
  ],
});
