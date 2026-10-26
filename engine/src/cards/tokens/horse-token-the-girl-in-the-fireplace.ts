import { defineCard } from "../define.js";

// The Girl in the Fireplace's Horse token.

export default defineCard({
  name: "Horse Token (The Girl in the Fireplace)",
  art: "dea25527-2c98-4c6b-ac1c-cabf69fda851",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 2,
  toughness: 2,
  text: "Doctors you control have horsemanship. (They can't be blocked except by creatures with horsemanship.)",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Doctor" },
      grantKeywords: ["horsemanship"],
      text: "Doctors you control have horsemanship.",
    },
  ],
});
