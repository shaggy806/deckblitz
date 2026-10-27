import { defineCard } from "../define.js";

// EDHREC rank 4733.

export default defineCard({
  name: "Thraben Watcher",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nOther nontoken creatures you control get +1/+1 and have vigilance.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", token: false }, excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: "Other nontoken creatures you control get +1/+1 and have vigilance.",
    },
  ],
});
