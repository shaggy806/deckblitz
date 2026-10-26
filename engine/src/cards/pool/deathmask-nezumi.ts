import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 27197.
const TEXT =
  "As long as you have seven or more cards in hand, this creature gets +2/+1 and has fear. (It can't be blocked except by artifact creatures and/or black creatures.)";

export default defineCard({
  name: "Deathmask Nezumi",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atLeast: 7 },
      grantPt: [2, 1],
      grantKeywords: ["fear"],
      text: TEXT,
    },
  ],
});
