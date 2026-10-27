import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 31260.

const TEXT = "This creature gets +1/+1 as long as you control a Swamp.";

export default defineCard({
  name: "Mire Kavu",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
