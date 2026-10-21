import { defineCard } from "../define.js";

// EDHREC rank 10286.

const TEXT = "Attacking non-Human creatures you control get +1/+0 and have trample.";

export default defineCard({
  name: "Ferocity of the Wilds",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", attacking: true, controlledBy: "you", notSubtypes: ["Human"] },
      },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
