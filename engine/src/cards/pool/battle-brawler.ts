import { defineCard } from "../define.js";

// EDHREC rank 25003.
//
// Rulings:
//   [2014-11-24] If Battle Brawler assigns combat damage during the first combat damage step, and
//     then it loses first strike before the second combat damage step (perhaps because you no
//     longer control a red or white permanent), it won't assign combat damage again in the second
//     combat damage step.

export default defineCard({
  name: "Battle Brawler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 2,
  toughness: 2,
  text: "As long as you control a red or white permanent, this creature gets +1/+0 and has first strike.",
  static: [
    {
      affects: { scope: "self" },
      // "A red or white permanent" — itself included, should it become one.
      condition: {
        kind: "controls",
        filter: { anyOf: [{ colors: ["R"] }, { colors: ["W"] }] },
        atLeast: 1,
        countsSelf: true,
      },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: "As long as you control a red or white permanent, this creature gets +1/+0 and has first strike.",
    },
  ],
});
