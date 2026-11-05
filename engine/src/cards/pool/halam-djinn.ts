import { defineCard } from "../define.js";

// EDHREC rank 32194.

export default defineCard({
  name: "Halam Djinn",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 6,
  toughness: 5,
  keywords: ["haste"],
  text: "Haste\nThis creature gets -2/-2 as long as red is the most common color among all permanents or is tied for most common.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [-2, -2],
      text: "This creature gets -2/-2 as long as red is the most common color among all permanents or is tied for most common.",
      condition: { kind: "most-common-color", color: "R" },
    },
  ],
});
