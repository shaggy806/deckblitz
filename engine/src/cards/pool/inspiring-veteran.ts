import { defineCard } from "../define.js";

// EDHREC rank 13234. Throne of Eldraine.

export default defineCard({
  name: "Inspiring Veteran",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Other Knights you control get +1/+1.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Knight", controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: "Other Knights you control get +1/+1.",
    },
  ],
});
