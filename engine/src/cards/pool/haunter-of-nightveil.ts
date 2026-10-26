import { defineCard } from "../define.js";

// EDHREC rank 29397.

export default defineCard({
  name: "Haunter of Nightveil",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  text: "Creatures your opponents control get -1/-0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      grantPt: [-1, 0],
      text: "Creatures your opponents control get -1/-0.",
    },
  ],
});
