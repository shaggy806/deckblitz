import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 19962.
//
// Rulings:
//   [2009-10-01] Anaba Spirit Crafter’s ability affects all Minotaurs, including Anaba Spirit
//     Crafter itself.

export default defineCard({
  name: "Anaba Spirit Crafter",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 1,
  toughness: 3,
  text: "Minotaur creatures get +1/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Minotaur" } },
      grantPt: [1, 0],
      text: "Minotaur creatures get +1/+0.",
    },
  ],
});
