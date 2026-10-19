import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11204.
//
// "Equip {2} or {B}" is two equip abilities (rule 702.6a), one for each cost.

const DIES_TEXT = "Whenever equipped creature dies, draw a card.";

export default defineCard({
  name: "Transmogrant's Crown",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+0.\n${DIES_TEXT}\nEquip {2} or {B}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [equip("{2}"), equip("{B}")],
});
