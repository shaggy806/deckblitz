import { defineCard } from "../define.js";

// EDHREC rank 20591. Modern Horizons 2.
export default defineCard({
  name: "Vedalken Infiltrator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue"],
  power: 1,
  toughness: 3,
  text: "This creature can't be blocked.\nMetalcraft — This creature gets +1/+0 as long as you control three or more artifacts.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantPt: [1, 0],
      text: "Metalcraft — This creature gets +1/+0 as long as you control three or more artifacts.",
    },
  ],
});
