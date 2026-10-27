import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 25951. Dirty Wererat's threshold static.

const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and can't block.";

export default defineCard({
  name: "Frightcrawler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  keywords: ["fear"],
  text: `Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      restrictions: ["cant-block"],
      text: THRESHOLD_TEXT,
    },
  ],
});
