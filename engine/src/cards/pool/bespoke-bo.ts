import { defineCard } from "../define.js";

// EDHREC rank 17376.


const ENTER_TEXT = "When this Equipment enters, return up to one other target nonland permanent to its owner's hand.";
const STATIC_TEXT = "Equipped creature gets +2/+1 and has vigilance.";

// Disruptor of Currents' enters trigger on an Equipment.
export default defineCard({
  name: "Bespoke Bō",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantKeywords: ["vigilance"],
      text: STATIC_TEXT,
    },
  ],
});
