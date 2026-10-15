import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 18104. Twin Blades' enters shape.

const ENTER_TEXT =
  "When this Equipment enters, attach it to target creature you control. That creature gains first strike until end of turn.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+0.";

export default defineCard({
  name: "Squire's Lightblade",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${EQUIPPED_TEXT}\nEquip {3}`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: EQUIPPED_TEXT }],
  activated: [equip("{3}")],
});
