import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 23593. With no non-Human creature to target, the trigger has no
// target and it stays unattached (the ruling).

const ENTERS = "When this Equipment enters, attach it to target non-Human creature you control.";

export default defineCard({
  name: "Rosethorn Halberd",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +2/+1.\nEquip {5} ({5}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSubtypes: ["Human"] } }],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  activated: [equip("{5}")],
});
