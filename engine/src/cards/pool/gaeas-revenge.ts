import { defineCard } from "../define.js";

export default defineCard({
  name: "Gaea's Revenge",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 5,
  keywords: ["haste"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nHaste\nThis creature can't be the target of nongreen spells or abilities from nongreen sources.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-targeted", object: { isSource: true }, sourceFilter: { notColors: ["G"] } }],
      text: "This creature can't be the target of nongreen spells or abilities from nongreen sources.",
    },
  ],
});
