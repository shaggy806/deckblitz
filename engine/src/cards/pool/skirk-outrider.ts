import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 31990.

export default defineCard({
  name: "Skirk Outrider",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: "As long as you control a Beast, this creature gets +2/+2 and has trample.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Beast" }, atLeast: 1, countsSelf: true },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      text: "As long as you control a Beast, this creature gets +2/+2 and has trample.",
    },
  ],
});
