import { defineCard } from "../define.js";

// EDHREC rank 28218. Shadowmoor. A characteristic-defining ability (rule 604.3): itself counted
// while it's black.

export default defineCard({
  name: "Crowd of Cinders",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nCrowd of Cinders's power and toughness are each equal to the number of black permanents you control.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { colors: ["B"], controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: "Crowd of Cinders's power and toughness are each equal to the number of black permanents you control.",
    },
  ],
});
