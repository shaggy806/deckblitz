import { defineCard } from "../define.js";

// EDHREC rank 32050.

export default defineCard({
  name: "Sulam Djinn",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nThis creature gets -2/-2 as long as green is the most common color among all permanents or is tied for most common.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [-2, -2],
      text: "This creature gets -2/-2 as long as green is the most common color among all permanents or is tied for most common.",
      condition: { kind: "most-common-color", color: "G" },
    },
  ],
});
