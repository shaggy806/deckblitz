import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Fifth Dawn (5DN). EDHREC rank 21040. The {G}{G} ability is Cranial
// Plating's: equip's shape at instant speed, and not an equip ability.

const PUMP_TEXT = "Equipped creature gets +1/+1 and has trample.";
const ATTACH_TEXT = "{G}{G}: Attach this Equipment to target creature you control.";

export default defineCard({
  name: "Horned Helm",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${ATTACH_TEXT}\nEquip {1}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["trample"], text: PUMP_TEXT }],
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
    equip("{1}"),
  ],
});
