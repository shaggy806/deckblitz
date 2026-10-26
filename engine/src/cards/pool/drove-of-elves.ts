import { defineCard } from "../define.js";

export default defineCard({
  name: "Drove of Elves",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 0,
  toughness: 0,
  keywords: ["hexproof"],
  text: "Hexproof\nDrove of Elves's power and toughness are each equal to the number of green permanents you control.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { colors: ["G"], controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: "Drove of Elves's power and toughness are each equal to the number of green permanents you control.",
    },
  ],
});
