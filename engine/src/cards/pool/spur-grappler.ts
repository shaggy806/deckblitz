import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 32153.

const TEXT = "This creature gets +2/+1 as long as you control no untapped lands.";

export default defineCard({
  name: "Spur Grappler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      grantPt: [2, 1],
      text: TEXT,
    },
  ],
});
