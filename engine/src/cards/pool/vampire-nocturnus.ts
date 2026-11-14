import { defineCard } from "../define.js";

// "This creature and other Vampire creatures you control": two statics, so
// Nocturnus keeps its bonus if it stops being a Vampire. The top card is read
// live, as it changes (a draw, a shuffle).

const REVEAL_TEXT = "Play with the top card of your library revealed.";
const BLACK_TEXT =
  "As long as the top card of your library is black, this creature and other Vampire creatures you control get +2/+1 and have flying.";

const TOP_IS_BLACK = { kind: "library-top", filter: { colors: ["B"] } } as const;

export default defineCard({
  name: "Vampire Nocturnus",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: `${REVEAL_TEXT}\n${BLACK_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { libraryTopRevealed: "you" }, text: REVEAL_TEXT },
    {
      affects: { scope: "self" },
      condition: TOP_IS_BLACK,
      grantPt: [2, 1],
      grantKeywords: ["flying"],
      text: BLACK_TEXT,
    },
    {
      affects: { scope: "creatures-you-control", subtype: "Vampire", excludeSelf: true },
      condition: TOP_IS_BLACK,
      grantPt: [2, 1],
      grantKeywords: ["flying"],
      text: BLACK_TEXT,
    },
  ],
});
