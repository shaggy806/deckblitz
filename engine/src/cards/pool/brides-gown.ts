import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const PUMP = "Equipped creature gets +2/+0.";
const PAIR = "It gets an additional +0/+2 and has first strike as long as an Equipment named Groom's Finery is attached to a creature you control.";

export default defineCard({
  name: "Bride's Gown",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP} ${PAIR}\nEquip {2}`,
  activated: [equip("{2}")],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 0], text: PUMP },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "controls",
        filter: {
          type: "creature",
          attachments: { filter: { subtype: "Equipment", name: "Groom's Finery" } },
        },
        atLeast: 1,
      },
      grantPt: [0, 2],
      grantKeywords: ["first-strike"],
      text: PAIR,
    },
  ],
});
