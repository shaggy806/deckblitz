import { defineCard } from "../define.js";

const TEXT = "As long as you control an artifact, this creature gets +2/+0 and has trample.";

export default defineCard({
  name: "Scrapyard Mongrel",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (It can deal excess combat damage to the player or planeswalker it's attacking.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [2, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
