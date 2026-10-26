import { defineCard } from "../define.js";

// EDHREC rank 29294.
//
// Every other black creature, whoever controls it.

export default defineCard({
  name: "Stronghold Taskmaster",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Giant", "Minion"],
  power: 4,
  toughness: 3,
  text: "Other black creatures get -1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] }, excludeSelf: true },
      grantPt: [-1, -1],
      text: "Other black creatures get -1/-1.",
    },
  ],
});
