import { defineCard } from "../define.js";

// EDHREC rank 22551.

export default defineCard({
  name: "Broodwarden",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 4,
  toughness: 4,
  text: "Eldrazi Spawn creatures you control get +2/+1.",
  static: [
    {
      // "Eldrazi Spawn creatures": both creature types.
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtype: "Eldrazi", subtypes: ["Spawn"] },
      },
      grantPt: [2, 1],
      text: "Eldrazi Spawn creatures you control get +2/+1.",
    },
  ],
});
