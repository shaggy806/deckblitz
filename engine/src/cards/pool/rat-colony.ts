import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+0 for each other Rat you control.";

export default defineCard({
  name: "Rat Colony",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 1,
  text: `${TEXT}\nA deck can have any number of cards named Rat Colony.`,
  deckCopies: "any",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { subtype: "Rat", controlledBy: "you" },
        pt: [1, 0],
        excludeSelf: true,
      },
      text: TEXT,
    },
  ],
});
