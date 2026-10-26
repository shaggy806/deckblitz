import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 29714.
const TEXT = "As long as you have seven or more cards in hand, this creature gets +2/+1 and has first strike.";

export default defineCard({
  name: "Akki Underling",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atLeast: 7 },
      grantPt: [2, 1],
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
