import { defineCard } from "../define.js";

// EDHREC rank 23679.

const TEXT = "As long as you control a Jace planeswalker, this creature gets +1/+0 and can't be blocked.";

export default defineCard({
  name: "Jace's Sentinel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Jace" }, atLeast: 1 },
      grantPt: [1, 0],
      grantKeywords: ["unblockable"],
      text: TEXT,
    },
  ],
});
