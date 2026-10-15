import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 13460. Celestial Armor's shape.

const ENTER_TEXT =
  "When this Equipment enters, attach it to target creature you control. That creature gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Illvoi Light Jammer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\nEquipped creature gets +1/+2.\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
  activated: [equip("{3}")],
});
