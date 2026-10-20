import { defineCard } from "../define.js";

// A modal double-faced card (rule 712); the back face is Blackbloom Bog.
// "An opponent has eight or more cards in their graveyard" asks each
// opponent's graveyard on its own.

const BONUS_TEXT = "This creature gets +3/+0 as long as an opponent has eight or more cards in their graveyard.";

export default defineCard({
  name: "Blackbloom Rogue",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${BONUS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      grantPt: [3, 0],
      text: BONUS_TEXT,
    },
  ],
  faces: ["Blackbloom Rogue", "Blackbloom Bog"],
});
