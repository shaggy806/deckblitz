import { defineCard } from "../define.js";

// EDHREC rank 15147.
//
// Rulings:
//   [2025-11-17] Bark of Doran's second ability doesn't actually change any creature's power. It
//     changes only the amount of combat damage the creature assigns. All other rules and effects
//     that check power or toughness use the real values, even if they cause damage "equal to a
//     creature's power" to be dealt.

// Only the combat damage it assigns changes; its power doesn't (the ruling —
// `combatDamageByToughness`).
const DAMAGE_TEXT =
  "As long as equipped creature's toughness is greater than its power, it assigns combat damage equal to its toughness rather than its power.";

export default defineCard({
  name: "Bark of Doran",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +0/+1.\n${DAMAGE_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [
    { affects: { scope: "attached" }, grantPt: [0, 1], text: "Equipped creature gets +0/+1." },
    { affects: { scope: "attached" }, combatDamageByToughness: "if-toughness-greater", text: DAMAGE_TEXT },
  ],
});
