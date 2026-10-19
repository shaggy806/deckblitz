import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Agent Frank Horrigan's conditional indestructible, on the
// `enteredThisTurn` history clause (Cathedral Acolyte, Cactuar).
const TEXT = "This creature has indestructible as long as it entered this turn.";

export default defineCard({
  name: "Crew Captain",
  manaCost: "{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      grantKeywords: ["indestructible"],
      text: TEXT,
    },
  ],
});
