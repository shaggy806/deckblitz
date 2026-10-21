import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 19506.
// Makes Elemental → "1/1 Red Elemental Token".
//
// Dwarven Shortsword's create-then-attach, and Viridian Longbow's granted
// ability: the equipped creature is its source, so it's the creature that
// deals the damage, as it last existed (the rulings).

const ENTERS_TEXT = "When this Equipment enters, create a 1/1 red Elemental creature token, then attach this Equipment to it.";
const SAC_TEXT = "Sacrifice this creature: It deals 1 damage to any target.";
const EQUIPPED_TEXT = `Equipped creature has "${SAC_TEXT}"`;

export default defineCard({
  name: "Mask of Immolation",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "1/1 Red Elemental Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
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
