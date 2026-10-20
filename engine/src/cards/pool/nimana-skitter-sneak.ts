import { defineCard } from "../define.js";

const TEXT =
  "As long as an opponent has eight or more cards in their graveyard, this creature gets +1/+0 and has menace.";

export default defineCard({
  name: "Nimana Skitter-Sneak",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (It can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: TEXT,
    },
  ],
});
