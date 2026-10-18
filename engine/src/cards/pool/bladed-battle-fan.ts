import { defineCard } from "../define.js";

// EDHREC rank 15217.
//
// The indestructible is the creature's own until end of turn, kept even if
// the Equipment comes off (the ruling).
const ENTER_TEXT =
  "When this Equipment enters, attach it to target creature you control. That creature gains indestructible until end of turn.";

export default defineCard({
  name: "Bladed Battle-Fan",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\nEquipped creature gets +1/+0.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
