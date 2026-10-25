import { defineCard } from "../define.js";

// EDHREC rank 26332. Gravblade Heavy's shape.

const TEXT = "As long as you control an artifact, this creature gets +1/+0 and has deathtouch.";

export default defineCard({
  name: "Dhund Operative",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [1, 0],
      grantKeywords: ["deathtouch"],
      text: TEXT,
    },
  ],
});
