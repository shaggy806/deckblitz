import { defineCard } from "../define.js";

// EDHREC rank 30953.

const TEXT = "As long as you control a Rowan planeswalker, this creature gets +3/+0.";

export default defineCard({
  name: "Rowan's Battleguard",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Rowan" }, atLeast: 1, countsSelf: true },
      grantPt: [3, 0],
      text: TEXT,
    },
  ],
});
