import { defineCard } from "../define.js";

// EDHREC rank 10185. "Protection from each color" is protection from each of
// the five (the ruling).
const TEXT =
  "Metalcraft — This creature has protection from each color as long as you control three or more artifacts.";

export default defineCard({
  name: "Etched Champion",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      protection: { colors: ["W", "U", "B", "R", "G"] },
      text: TEXT,
    },
  ],
});
