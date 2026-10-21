import { defineCard } from "../define.js";

// EDHREC rank 10283.
//
// Rulings:
//   [2020-06-23] Because damage remains marked on a creature until the damage is removed as the
//     turn ends, nonlethal damage dealt to creatures may become lethal if Kaervek enters the
//     battlefield during that turn.
//   [2020-06-23] If you control more than one Kaervek, each will give each other creature -1/-1.

export default defineCard({
  name: "Kaervek, the Spiteful",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  text: "Other creatures get -1/-1.",
  static: [
    {
      affects: { scope: "all-creatures", excludeSelf: true },
      grantPt: [-1, -1],
      text: "Other creatures get -1/-1.",
    },
  ],
});
