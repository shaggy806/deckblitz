import { defineCard } from "../define.js";

// EDHREC rank 31769.

export default defineCard({
  name: "Zanam Djinn",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nThis creature gets -2/-2 as long as blue is the most common color among all permanents or is tied for most common.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [-2, -2],
      text: "This creature gets -2/-2 as long as blue is the most common color among all permanents or is tied for most common.",
      condition: { kind: "most-common-color", color: "U" },
    },
  ],
});
