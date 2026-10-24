import { defineCard } from "../define.js";

// EDHREC rank 21446. Devoid: colourless (`colors: []`).

export default defineCard({
  name: "Tide Drifter",
  manaCost: "{1}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 0,
  toughness: 5,
  text: "Devoid (This card has no color.)\nOther colorless creatures you control get +0/+1.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", colorless: true, controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [0, 1],
      text: "Other colorless creatures you control get +0/+1.",
    },
  ],
});
