import { defineCard } from "../define.js";

// EDHREC rank 31361. Gaining menace after it's blocked doesn't undo the
// block (the ruling): menace is checked only as blockers are declared.

export default defineCard({
  name: "Embraal Bruiser",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: "This creature enters tapped.\nThis creature has menace as long as you control an artifact.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantKeywords: ["menace"],
      text: "This creature has menace as long as you control an artifact.",
    },
  ],
});
