import { defineCard } from "../define.js";

// EDHREC rank 29534.

export default defineCard({
  name: "Meng Huo, Barbarian King",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Soldier"],
  power: 4,
  toughness: 4,
  text: "Other green creatures you control get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other green creatures you control get +1/+1.",
    },
  ],
});
