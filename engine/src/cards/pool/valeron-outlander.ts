import { defineCard } from "../define.js";

export default defineCard({
  name: "Valeron Outlander",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  text: "Protection from black",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
