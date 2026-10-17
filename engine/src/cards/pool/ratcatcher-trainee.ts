import { defineCard } from "../define.js";

// EDHREC rank 16793. Wilds of Eldraine. Adventure: Pest Problem.
const STRIKE_TEXT = "During your turn, this creature has first strike.";

export default defineCard({
  name: "Ratcatcher Trainee",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 1,
  text: STRIKE_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: STRIKE_TEXT,
    },
  ],
  faces: ["Ratcatcher Trainee", "Pest Problem"],
  adventure: true,
});
