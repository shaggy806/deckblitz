import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 13096.
const ENTERS = "When this Equipment enters, attach it to target creature you control.";

export default defineCard({
  name: "Dueling Rapier",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\nEquipped creature gets +2/+0.\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  activated: [equip("{4}")],
});
