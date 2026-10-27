import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 29945.

const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has flying.";

export default defineCard({
  name: "Mystic Crusader",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Mystic"],
  power: 2,
  toughness: 1,
  text: `Protection from black and from red\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B", "R"] },
      text: "Protection from black and from red",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: THRESHOLD_TEXT,
    },
  ],
});
