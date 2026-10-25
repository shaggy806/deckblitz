import { defineCard } from "../define.js";
import { renown } from "../helpers.js";

// EDHREC rank 6744.
//
// Rulings:
//   [2023-11-03] When a creature you control that isn't renowned deals combat damage to a player,
//     you'll put a +1/+1 counter on it and it will become renowned. Since it wasn't renowned when
//     it dealt combat damage, Aragorn, Hornburg Hero's last ability won't trigger, and you won't
//     double the number of +1/+1 counters on it.
//   [2023-11-03] Renown won't trigger when a creature deals damage to a planeswalker, a battle, or
//     another creature. It also won't trigger when a creature deals noncombat damage to a player.
//   [2023-11-03] If Aragorn, Hornburg Hero leaves the battlefield after first strike damage is
//     dealt but before regular combat damage, creatures you control that dealt first strike damage
//     but no longer have first strike won't also deal regular combat damage (unless they have
//     double strike for some reason).
//   [2023-11-03] If a creature has multiple instances of renown, each triggers separately. The
//     first one that resolves causes the creature to become renowned, which means any additional
//     renown abilities that creature has will have no effect. The creature's controller chooses
//     what order to put those renown abilities on the stack, so they can choose to have the
//     ability with the higher renown number resolve first.

export default defineCard({
  name: "Aragorn, Hornburg Hero",
  manaCost: "{1}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: "Attacking creatures you control have first strike and renown 1. (When a creature with renown 1 deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nWhenever a renowned creature you control deals combat damage to a player, double the number of +1/+1 counters on it.",
  static: [
    {
      // The granted renown is the creature's own: its source is that
      // creature, so it's that creature that becomes renowned.
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", attacking: true } },
      grantKeywords: ["first-strike"],
      grantsTriggered: [renown(1)],
      text: "Attacking creatures you control have first strike and renown 1.",
    },
  ],
  triggered: [
    {
      // Asked as the damage is dealt: the damage that makes it renowned
      // doesn't also double its counters (the ruling).
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature", renowned: true } },
      targets: [],
      effect: { kind: "double-counters", target: "trigger-object", counter: "+1/+1" },
      resolve: null,
      text: "Whenever a renowned creature you control deals combat damage to a player, double the number of +1/+1 counters on it.",
    },
  ],
});
