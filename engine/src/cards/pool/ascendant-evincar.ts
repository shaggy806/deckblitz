import { defineCard } from "../define.js";

// EDHREC rank 11973.
//
// Rulings:
//   [2004-10-04] If Ascendant Evincar stops being black, it gives itself -1/-1.
//
// Both anthems reach every player's creatures. The -1/-1 filter has no
// `excludeSelf`, so a nonblack Evincar shrinks itself (the ruling); the +1/+1
// one excludes it ("other").

const BLACK = "Other black creatures get +1/+1.";
const NONBLACK = "Nonblack creatures get -1/-1.";

export default defineCard({
  name: "Ascendant Evincar",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Vampire", "Noble"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${BLACK}\n${NONBLACK}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] }, excludeSelf: true },
      grantPt: [1, 1],
      text: BLACK,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notColors: ["B"] } },
      grantPt: [-1, -1],
      text: NONBLACK,
    },
  ],
});
