import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 15736.
//
// Rulings:
//   Raksha Golden Cub is a Cat, so it also gets +2/+2 and double strike if it's
//     equipped.

const LORD_TEXT =
  "As long as Raksha Golden Cub is equipped, Cat creatures you control get +2/+2 and have double strike.";

export default defineCard({
  name: "Raksha Golden Cub",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${LORD_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Cat", controlledBy: "you" } },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [2, 2],
      grantKeywords: ["double-strike"],
      text: LORD_TEXT,
    },
  ],
});
