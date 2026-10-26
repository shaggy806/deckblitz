import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 8824. Every Soldier, not only yours (Lord of
// Atlantis's shape).

const TEXT = "Other Soldier creatures get +1/+1 and have first strike. (They deal combat damage before creatures without first strike.)";

export default defineCard({
  name: "Field Marshal",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures", excludeSelf: true, subtype: "Soldier" },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
