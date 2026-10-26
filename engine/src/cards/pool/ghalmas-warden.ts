import { defineCard } from "../define.js";

// EDHREC rank 30066.

export default defineCard({
  name: "Ghalma's Warden",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 2,
  toughness: 4,
  text: "Metalcraft — This creature gets +2/+2 as long as you control three or more artifacts.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantPt: [2, 2],
      text: "Metalcraft — This creature gets +2/+2 as long as you control three or more artifacts.",
    },
  ],
});
