import { defineCard } from "../define.js";

// EDHREC rank 27236.

const THRESHOLD_TEXT =
  "Threshold — This creature gets +4/+4 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Metamorphic Wurm",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Wurm"],
  power: 3,
  toughness: 3,
  text: THRESHOLD_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [4, 4],
      text: THRESHOLD_TEXT,
    },
  ],
});
