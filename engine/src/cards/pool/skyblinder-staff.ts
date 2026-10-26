import { defineCard } from "../define.js";

// EDHREC rank 18892.
//
// Rulings:
//   [2013-01-24] If the equipped creature is blocked by a creature and then that creature gains
//     flying, the equipped creature will remain blocked.
//   [2013-01-24] The equipped creature can still be blocked by a creature with reach.

const TEXT = "Equipped creature gets +1/+0 and can't be blocked by creatures with flying.";

export default defineCard({
  name: "Skyblinder Staff",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      cantBeBlockedBy: { keyword: "flying" },
      text: TEXT,
    },
  ],
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
});
