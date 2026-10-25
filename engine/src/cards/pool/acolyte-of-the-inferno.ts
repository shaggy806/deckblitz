import { defineCard } from "../define.js";

// EDHREC rank 27495.
//
// Rulings:
//   [2015-06-22] Renown won't trigger when a creature deals combat damage to a planeswalker or
//     another creature. It also won't trigger when a creature deals noncombat damage to a player.
//   [2015-06-22] Acolyte of the Inferno's last ability triggers and resolves before combat damage
//     is dealt. If that causes each creature blocking Acolyte of the Inferno to be destroyed,
//     Acolyte of the Inferno will remain blocked and neither deal nor be dealt combat damage.
//   [2015-06-22] If a renown ability triggers, but the creature leaves the battlefield before that
//     ability resolves, the creature doesn't become renowned. Any ability that triggers "whenever
//     a creature becomes renowned" won't trigger.
//   [2015-06-22] Acolyte of the Inferno's last ability will trigger once for each creature that
//     blocks it. Each of those creatures will be dealt 2 damage.
//   [2015-06-22] If a creature with renown deals combat damage to its controller because that
//     damage was redirected, renown will trigger.

export default defineCard({
  name: "Acolyte of the Inferno",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 1,
  text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nWhenever this creature becomes blocked by a creature, it deals 2 damage to that creature.",
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
      // Once per blocking creature (the ruling), each the trigger object.
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature becomes blocked by a creature, it deals 2 damage to that creature.",
    },
  ],
});
