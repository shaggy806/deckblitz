import { defineCard } from "../define.js";

// EDHREC rank 27098.

const THRESHOLD_TEXT =
  "Threshold — This creature gets +2/+2 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Nimble Mongoose",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mongoose"],
  power: 1,
  toughness: 1,
  keywords: ["shroud"],
  text: `Shroud (This creature can't be the target of spells or abilities.)\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      text: THRESHOLD_TEXT,
    },
  ],
});
