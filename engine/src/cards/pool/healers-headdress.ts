import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 29905.
//
// The {W}{W} ability is Cranial Plating's: equip's shape at instant speed, and
// not an equip ability. The granted ability is Hot Springs'.

const STATIC_TEXT =
  'Equipped creature gets +0/+2 and has "{T}: Prevent the next 1 damage that would be dealt to any target this turn."';
const GRANTED = "{T}: Prevent the next 1 damage that would be dealt to any target this turn.";
const ATTACH_TEXT = "{W}{W}: Attach this Equipment to target creature you control.";

export default defineCard({
  name: "Healer's Headdress",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${ATTACH_TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "prevent-damage", target: 0, amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
    equip("{1}"),
  ],
});
