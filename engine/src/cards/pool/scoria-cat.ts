import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 31935.

const TEXT = "This creature gets +3/+3 as long as you control no untapped lands.";

export default defineCard({
  name: "Scoria Cat",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      grantPt: [3, 3],
      text: TEXT,
    },
  ],
});
