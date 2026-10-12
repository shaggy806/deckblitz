import { defineCard } from "../define.js";

export default defineCard({
  name: "Sabertooth Nishoba",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Beast", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample, protection from blue and from red",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["U", "R"] },
      text: "Protection from blue and from red",
    },
  ],
});
