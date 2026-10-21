import { defineCard } from "../define.js";

const TEXT = "As long as you've drawn two or more cards this turn, this creature has double strike.";

export default defineCard({
  name: "Spinehorn Minotaur",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Berserker"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
