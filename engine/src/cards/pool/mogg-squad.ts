import { defineCard } from "../define.js";

export default defineCard({
  name: "Mogg Squad",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  text: "This creature gets -1/-1 for each other creature on the battlefield.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature" }, pt: [-1, -1], excludeSelf: true },
      text: "This creature gets -1/-1 for each other creature on the battlefield.",
    },
  ],
});
