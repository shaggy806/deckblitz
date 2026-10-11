import { defineCard } from "../define.js";

export default defineCard({
  name: "Samut, Hazoret's Champion",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Creatures you control have haste.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["haste"],
      text: "Creatures you control have haste.",
    },
  ],
});
