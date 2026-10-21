import { defineCard } from "../define.js";

// Legends. EDHREC rank 28453.
//
// Rulings:
//   [2004-10-04] Gives himself +0/+2.

export default defineCard({
  name: "Jacques le Vert",
  manaCost: "{1}{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Green creatures you control get +0/+2.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" } },
      grantPt: [0, 2],
      text: "Green creatures you control get +0/+2.",
    },
  ],
});
