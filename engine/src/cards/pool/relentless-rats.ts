import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+1 for each other creature on the battlefield named Relentless Rats.";

export default defineCard({
  name: "Relentless Rats",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 2,
  text: `${TEXT}\nA deck can have any number of cards named Relentless Rats.`,
  deckCopies: "any",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { type: "creature", name: "Relentless Rats" },
        pt: [1, 1],
        excludeSelf: true,
      },
      text: TEXT,
    },
  ],
});
