import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 22806.
//
// Viridian Longbow's granted-ability shape: the equipped creature is the
// source of the ability and its damage (2018-03-16 ruling). Cement Shoes'
// doesn't-untap restriction reads the creature attached as the untap step
// begins.

const GRANTED = "{T}: This creature deals 2 damage to any target.";
const UNTAP = "Equipped creature doesn't untap during its controller's untap step.";
const GRANT_TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Heavy Arbalest",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${UNTAP}\n${GRANT_TEXT}\nEquip {4}`,
  static: [
    { affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: UNTAP },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
