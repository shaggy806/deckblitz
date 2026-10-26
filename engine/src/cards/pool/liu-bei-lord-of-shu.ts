import { defineCard } from "../define.js";

// EDHREC rank 25996.
//
// Rulings:
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn't
//     interact with flying or reach.

export default defineCard({
  name: "Liu Bei, Lord of Shu",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nLiu Bei gets +2/+2 as long as you control a permanent named Guan Yu, Sainted Warrior or a permanent named Zhang Fei, Fierce Warrior.",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { name: "Guan Yu, Sainted Warrior" }, atLeast: 1 },
          { kind: "controls", filter: { name: "Zhang Fei, Fierce Warrior" }, atLeast: 1 },
        ],
      },
      grantPt: [2, 2],
      text: "Liu Bei gets +2/+2 as long as you control a permanent named Guan Yu, Sainted Warrior or a permanent named Zhang Fei, Fierce Warrior.",
    },
  ],
});
