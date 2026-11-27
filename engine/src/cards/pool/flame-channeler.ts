import { defineCard } from "../define.js";

// EDHREC rank 23007.
//
// Rulings:
//   [2021-09-24] "A spell you control" means a spell on the stack. Usually, spells on the stack can
//     deal damage only as part of their own resolution.
//   [2021-09-24] A spell that becomes a permanent and then deals damage, such as one that has a
//     triggered ability when it enters the battlefield, will not cause Flame Channeler's abilities
//     to trigger.
//   [2021-09-24] Some spells cause other objects to deal damage, such as spells that have two
//     creatures fight. In those cases, it's those other objects that are dealing damage, not the
//     spell itself, and this will not cause Flame Channeler's abilities to trigger.
//
// "A spell you control deals damage": the damage's source is a spell (`isSpell`, on the stack as
// it deals it), whatever its type.

const TEXT = "When a spell you control deals damage, transform this creature.";

export default defineCard({
  name: "Flame Channeler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { isSpell: true } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Flame Channeler", "Embodiment of Flame"],
  transform: true,
});
