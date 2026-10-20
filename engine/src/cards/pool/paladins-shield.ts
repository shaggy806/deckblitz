import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 20414.
const ENTERS = "When this Equipment enters, attach it to target creature you control.";

export default defineCard({
  name: "Paladin's Shield",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\nEquipped creature gets +0/+2.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], text: "Equipped creature gets +0/+2." }],
  activated: [equip("{3}")],
});
