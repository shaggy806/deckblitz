import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11538.
// Coral Sword's enters trigger and Boots of Speed's static.

const ENTER_TEXT =
  "When this Equipment enters, attach it to target creature you control. That creature gains first strike until end of turn.";

export default defineCard({
  name: "Hidden Footblade",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\nEquipped creature gets +1/+0 and has haste.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["haste"],
      text: "Equipped creature gets +1/+0 and has haste.",
    },
  ],
  activated: [equip("{2}")],
});
