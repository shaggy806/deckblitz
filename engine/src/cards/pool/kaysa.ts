import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 20690.
//
// Rulings:
//   [2008-10-01] Kaysa's ability affects itself.

export default defineCard({
  name: "Kaysa",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 3,
  text: "Green creatures you control get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" } },
      grantPt: [1, 1],
      text: "Green creatures you control get +1/+1.",
    },
  ],
});
