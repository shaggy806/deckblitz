import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 20471.
//
// Rulings:
//   [2021-09-24] If the target creature becomes an illegal target, the Equipment remains on the
//     battlefield unattached.
//   [2021-09-24] Attaching an Equipment with its enters-the-battlefield triggered ability isn't
//     the same as using its equip ability. You don't pay mana for the attachment, and the timing
//     restrictions for equip abilities don't apply.
//   [2021-11-19] Bramble Armor doesn't enter the battlefield attached to a creature. Instead, the
//     Equipment enters the battlefield and then a triggered ability attaches it to a creature. You
//     may cast Bramble Armor even if you don't control any creatures.

export default defineCard({
  name: "Bramble Armor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "When this Equipment enters, attach it to target creature you control.\nEquipped creature gets +2/+1.\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)",
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      text: "When this Equipment enters, attach it to target creature you control.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  activated: [equip("{4}")],
});
