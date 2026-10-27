import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 32013.

export default defineCard({
  name: "Fen Stalker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 3,
  toughness: 2,
  text: "This creature has fear as long as you control no untapped lands. (It can't be blocked except by artifact creatures and/or black creatures.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      grantKeywords: ["fear"],
      text: "This creature has fear as long as you control no untapped lands.",
    },
  ],
});
