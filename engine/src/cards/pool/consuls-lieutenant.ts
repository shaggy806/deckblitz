import { defineCard } from "../define.js";

// EDHREC rank 22168.
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
  name: "Consul's Lieutenant",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nRenown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nWhenever this creature attacks, if it's renowned, other attacking creatures you control get +1/+1 until end of turn.",
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
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever this creature attacks, if it's renowned, other attacking creatures you control get +1/+1 until end of turn.",
      condition: { kind: "source", filter: { renowned: true } },
    },
  ],
});
