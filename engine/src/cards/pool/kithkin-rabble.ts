import { defineCard } from "../define.js";

export default defineCard({
  name: "Kithkin Rabble",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance"],
  text: "Vigilance\nKithkin Rabble's power and toughness are each equal to the number of white permanents you control.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { colors: ["W"], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: "Kithkin Rabble's power and toughness are each equal to the number of white permanents you control.",
    },
  ],
});
