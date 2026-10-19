import { defineCard } from "../define.js";

// EDHREC rank 11311.
//
// "Sacrifice another Cleric" (`otherOnly`): any Cleric permanent you control
// but this one.
const ANTHEM_TEXT = "Other Clerics you control get +1/+1.";
const TUTOR_TEXT =
  "{3}{B}{B}, {T}, Sacrifice another Cleric: Search your library for a black creature card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Shadow-Rite Priest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM_TEXT}\n${TUTOR_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Cleric", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: true, sacrifice: { filter: { subtype: "Cleric" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature", colors: ["B"] },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TUTOR_TEXT,
    },
  ],
});
