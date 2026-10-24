import { defineCard } from "../define.js";

// EDHREC rank 18583.
//
// Rulings:
//   [2015-06-22] If a creature with renown deals combat damage to its controller because that
//     damage was redirected, renown will trigger.
//   [2015-06-22] Renown won’t trigger when a creature deals combat damage to a planeswalker or
//     another creature. It also won’t trigger when a creature deals noncombat damage to a player.
//   [2015-06-22] If a renown ability triggers, but the creature leaves the battlefield before that
//     ability resolves, the creature doesn’t become renowned. Any ability that triggers “whenever
//     a creature becomes renowned” won’t trigger.

export default defineCard({
  name: "Honored Hierarch",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nAs long as this creature is renowned, it has vigilance and \"{T}: Add one mana of any color.\"",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 1 },
      resolve: null,
      text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { renowned: true } },
      grantKeywords: ["vigilance"],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 1 },
          resolve: null,
          text: "{T}: Add one mana of any color.",
        },
      ],
      text: 'As long as this creature is renowned, it has vigilance and "{T}: Add one mana of any color."',
    },
  ],
});
