import { defineCard } from "../define.js";

// EDHREC rank 656.

export default defineCard({
  name: "Trailblazer's Boots",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has nonbasic landwalk. (It can't be blocked as long as defending player controls a nonbasic land.)\nEquip {2}",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      landwalk: { type: "land", notSupertype: "basic" },
      text: "Equipped creature has nonbasic landwalk.",
    },
  ],
});
