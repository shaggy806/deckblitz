import { defineCard } from "../define.js";

// EDHREC rank 20892. With no Knight to target as it enters, the trigger has
// no target and it stays unattached (the ruling).

const ENTER_TEXT = "When this Equipment enters, attach it to target Knight you control.";
const STATIC_TEXT = "Equipped creature gets +0/+2 and has vigilance.";

export default defineCard({
  name: "Shining Armor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Knight" } }],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      grantKeywords: ["vigilance"],
      text: STATIC_TEXT,
    },
  ],
});
