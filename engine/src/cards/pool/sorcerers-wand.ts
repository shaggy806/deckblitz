import { defineCard } from "../define.js";

// EDHREC rank 16203.
//
// Rulings:
//   [2018-04-27] Whether the equipped creature is a Wizard is checked only as the ability
//     resolves. If that creature has left the battlefield, use its last known information to
//     determine if it was a Wizard.
//   [2018-04-27] The equipped creature, not Sorcerer's Wand, is the source of the damage-dealing
//     ability and of the damage dealt.
//
// Viridian Longbow's granted ability: its source is the equipped creature, so
// the `source` condition reads that creature (its last-known self if gone).

const GRANT_TEXT =
  "Equipped creature has \"{T}: This creature deals 1 damage to target player or planeswalker. If this creature is a Wizard, it deals 2 damage instead.\"";

export default defineCard({
  name: "Sorcerer's Wand",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player-or-planeswalker"],
          effect: {
            kind: "conditional",
            condition: { kind: "source", filter: { subtype: "Wizard" } },
            then: { kind: "damage", amount: 2, target: 0 },
            else: { kind: "damage", amount: 1, target: 0 },
          },
          resolve: null,
          text: "{T}: This creature deals 1 damage to target player or planeswalker. If this creature is a Wizard, it deals 2 damage instead.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
