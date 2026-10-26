import { defineCard } from "../define.js";
import { equip, livingWeapon } from "../helpers.js";

// EDHREC rank 16861.
//
// Rulings:
//   The sacrificed creature deals the damage as it last existed on the
//     battlefield (Mask of Immolation's granted ability).
//   Living weapon's Germ is attached before state-based actions see a 0/0.

const SAC_TEXT = "Sacrifice this creature: This creature deals 1 damage to any target.";
const EQUIPPED_TEXT = `Equipped creature gets +0/+1 and has "${SAC_TEXT}"`;

export default defineCard({
  name: "Mortarpod",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\n${EQUIPPED_TEXT}\nEquip {2}`,
  triggered: [livingWeapon()],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 1],
      grantsActivated: [
        {
          cost: { mana: null, tap: false, sacrifice: "self" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: SAC_TEXT,
        },
      ],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
