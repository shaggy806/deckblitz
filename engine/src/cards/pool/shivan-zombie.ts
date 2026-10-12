import { defineCard } from "../define.js";

export default defineCard({
  name: "Shivan Zombie",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Barbarian", "Zombie"],
  power: 2,
  toughness: 2,
  text: "Protection from white",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
