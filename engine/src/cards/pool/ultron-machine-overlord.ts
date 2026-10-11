import { defineCard } from "../define.js";

// EDHREC rank 14044. Marvel Super Heroes Commander.

const ANTHEM_TEXT = "Other Robots and Constructs you control get +2/+2.";

export default defineCard({
  name: "Ultron, Machine Overlord",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ANTHEM_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { subtypes: ["Robot", "Construct"], controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
  ],
});
