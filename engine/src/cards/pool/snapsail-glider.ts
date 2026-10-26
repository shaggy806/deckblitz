import { defineCard } from "../define.js";

// EDHREC rank 28803.

const TEXT = "Metalcraft — This creature has flying as long as you control three or more artifacts.";

export default defineCard({
  name: "Snapsail Glider",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
