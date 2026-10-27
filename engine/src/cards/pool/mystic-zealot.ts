import { defineCard } from "../define.js";

// EDHREC rank 31359.

const TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has flying.";

export default defineCard({
  name: "Mystic Zealot",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Mystic"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
