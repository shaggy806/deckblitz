import { defineCard } from "../define.js";

// Rulings:
//   If the target creature becomes an illegal target, the Equipment remains on the
//   battlefield unattached.
//   Attaching with the enters trigger isn't the same as using its equip ability.

const ENTERS = "When this Equipment enters, attach it to target creature you control.";

export default defineCard({
  name: "Utility Knife",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +1/+1.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
});
