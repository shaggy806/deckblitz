import { defineCard } from "../define.js";

// EDHREC rank 25584. A creature that is white or an artifact, whatever else it
// is, doesn't stop the bonus (the ruling).

export default defineCard({
  name: "Angelic Voices",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Creatures you control get +1/+1 as long as you control no nonartifact, nonwhite creatures.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", notTypes: ["artifact"], notColors: ["W"] }, atLeast: 1 },
      },
      grantPt: [1, 1],
      text: "Creatures you control get +1/+1 as long as you control no nonartifact, nonwhite creatures.",
    },
  ],
});
