import { defineCard } from "../define.js";

// EDHREC rank 25022.

export default defineCard({
  name: "Vectis Gloves",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+0 and has artifact landwalk. (It can't be blocked as long as defending player controls an artifact land.)\nEquip {2}",
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
      grantPt: [2, 0],
      landwalk: { types: ["artifact", "land"] },
      text: "Equipped creature gets +2/+0 and has artifact landwalk.",
    },
  ],
});
