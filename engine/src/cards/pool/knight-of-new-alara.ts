import { defineCard } from "../define.js";

// EDHREC rank 7058.
export default defineCard({
  name: "Knight of New Alara",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Each other multicolored creature you control gets +1/+1 for each of its colors.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true }, excludeSelf: true },
      grantPtPerCount: { ofAffected: "colors", pt: [1, 1] },
      text: "Each other multicolored creature you control gets +1/+1 for each of its colors.",
    },
  ],
});
