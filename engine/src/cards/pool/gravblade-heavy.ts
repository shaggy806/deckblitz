import { defineCard } from "../define.js";

const TEXT = "As long as you control an artifact, this creature gets +1/+0 and has deathtouch.";

export default defineCard({
  name: "Gravblade Heavy",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
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
