import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+1 for each other creature named Seven Dwarves you control.";

export default defineCard({
  name: "Seven Dwarves",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 2,
  toughness: 2,
  text: `${TEXT}\nA deck can have up to seven cards named Seven Dwarves.`,
  deckCopies: 7,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { type: "creature", controlledBy: "you", name: "Seven Dwarves" },
        pt: [1, 1],
        excludeSelf: true,
      },
      text: TEXT,
    },
  ],
});
