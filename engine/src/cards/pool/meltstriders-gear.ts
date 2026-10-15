import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 18392. Biorganic Carapace's enters shape.

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const EQUIPPED_TEXT = "Equipped creature gets +2/+1 and has reach.";

export default defineCard({
  name: "Meltstrider's Gear",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${EQUIPPED_TEXT}\nEquip {5} ({5}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], grantKeywords: ["reach"], text: EQUIPPED_TEXT }],
  activated: [equip("{5}")],
});
