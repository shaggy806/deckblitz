import { defineCard } from "../define.js";

// EDHREC rank 18368.
//
// Rulings:
//   [2016-07-13] If Permeating Mass becomes a copy of another creature before its triggered ability
//     resolves, the damaged creature will become a copy of that creature.
//   [2016-07-13] A creature dealt lethal damage during combat won't survive long enough to become a
//     copy of Permeating Mass. If Permeating Mass is dealt lethal damage during combat, the creature
//     Permeating Mass dealt damage to still becomes a copy of it.
//   [2016-07-13] The damaged creature copies the printed values of Permeating Mass. It won't copy
//     counters on Permeating Mass or effects that have changed its power, toughness, types, color,
//     or so on. Notably, this means that a creature that becomes a copy of Permeating Mass has the
//     ability to permeate other creatures as well.

export default defineCard({
  name: "Permeating Mass",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  text: "Whenever this creature deals combat damage to a creature, that creature becomes a copy of this creature.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "become-copy", target: "trigger-recipient", of: "source" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, that creature becomes a copy of this creature.",
    },
  ],
});
