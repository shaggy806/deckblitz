import { defineCard } from "../define.js";

// EDHREC rank 14256.
//
// Rulings:
//   [2021-06-18] If a token creature is exiled this way, it will cease to exist and won't return
//     to the battlefield.
//   [2021-06-18] Renown won't trigger when a creature deals combat damage to a planeswalker or
//     another creature. It also won't trigger when a creature deals noncombat damage to a player.
//   [2021-06-18] If Constable of the Realm leaves the battlefield before its last triggered
//     ability resolves, the target permanent won't be exiled.
//   [2021-06-18] Constable of the Realm's last ability triggers whenever a +1/+1 counter is put on
//     it for any reason, not just because of its renown ability.
//   [2021-06-18] Auras attached to the exiled permanent will be put into their owners' graveyards.
//     Equipment attached to it will become unattached and remain on the battlefield. Any counters
//     on the exiled permanent will cease to exist.
//   [2021-06-18] If a creature with renown deals combat damage to its controller because that
//     damage was redirected, renown will trigger.
//   [2021-06-18] All permanents exiled by Constable of the Realm will return to the battlefield at
//     the same time, and each one will enter under its owner's control.

export default defineCard({
  name: "Constable of the Realm",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 3,
  toughness: 3,
  text: "Renown 2 (When this creature deals combat damage to a player, if it isn't renowned, put two +1/+1 counters on it and it becomes renowned.)\nWhenever one or more +1/+1 counters are put on this creature, exile up to one other target nonland permanent until this creature leaves the battlefield.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 2 },
      resolve: null,
      text: "Renown 2 (When this creature deals combat damage to a player, if it isn't renowned, put two +1/+1 counters on it and it becomes renowned.)",
    },
    {
      // Any +1/+1 counter, not only renown's (the ruling); one that has left
      // exiles nothing (`untilSourceLeaves`).
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: "Whenever one or more +1/+1 counters are put on this creature, exile up to one other target nonland permanent until this creature leaves the battlefield.",
    },
  ],
});
