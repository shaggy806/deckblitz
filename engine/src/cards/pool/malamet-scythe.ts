import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 21081. The Lost Caverns of Ixalan.

const ENTERS = "When this Equipment enters, attach it to target creature you control.";

export default defineCard({
  name: "Malamet Scythe",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\nEquipped creature gets +2/+2.\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
  activated: [equip("{4}")],
});
