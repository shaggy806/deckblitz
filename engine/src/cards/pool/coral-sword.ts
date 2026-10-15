import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14262. Twin Blades' shape, with first strike.

const ENTER_TEXT =
  "When this Equipment enters, attach it to target creature you control. That creature gains first strike until end of turn.";

export default defineCard({
  name: "Coral Sword",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\nEquipped creature gets +1/+0.\nEquip {1}`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  activated: [equip("{1}")],
});
