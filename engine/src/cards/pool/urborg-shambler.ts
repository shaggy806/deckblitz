import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29713. Stronghold Taskmaster's static.

export default defineCard({
  name: "Urborg Shambler",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
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
