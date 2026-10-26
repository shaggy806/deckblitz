import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 21605.
//
// Viridian Longbow's shape, twice: the granted abilities belong to the
// equipped creature, so it is their source, it taps for them and only its
// controller activates them (the rulings).

const PING = "{T}: This creature deals 1 damage to any target";
const WEREWOLF = "{T}: This creature deals 3 damage to target Werewolf creature.";
const TEXT = `Equipped creature has "${PING}" and "${WEREWOLF}"`;

export default defineCard({
  name: "Wolfhunter's Quiver",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {5}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: `${PING}.`,
        },
        {
          cost: { mana: null, tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Werewolf" } }],
          effect: { kind: "damage", amount: 3, target: 0 },
          resolve: null,
          text: WEREWOLF,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{5}")],
});
