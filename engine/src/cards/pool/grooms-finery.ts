import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const PUMP = "Equipped creature gets +2/+0.";
const PAIR = "It gets an additional +0/+2 and has deathtouch as long as an Equipment named Bride's Gown is attached to a creature you control.";

export default defineCard({
  name: "Groom's Finery",
  manaCost: "{1}{B}",
  colors: ["B"],
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
          attachments: { filter: { subtype: "Equipment", name: "Bride's Gown" } },
        },
        atLeast: 1,
      },
      grantPt: [0, 2],
      grantKeywords: ["deathtouch"],
      text: PAIR,
    },
  ],
});
