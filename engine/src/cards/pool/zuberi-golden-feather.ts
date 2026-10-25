import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 22511.

export default defineCard({
  name: "Zuberi, Golden Feather",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nOther Griffin creatures get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Griffin" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other Griffin creatures get +1/+1.",
    },
  ],
});
