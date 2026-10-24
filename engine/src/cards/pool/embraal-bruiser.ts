import { defineCard } from "../define.js";

const MENACE_TEXT = "This creature has menace as long as you control an artifact.";

export default defineCard({
  name: "Embraal Bruiser",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: `This creature enters tapped.\n${MENACE_TEXT}`,
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
      text: MENACE_TEXT,
    },
  ],
});
