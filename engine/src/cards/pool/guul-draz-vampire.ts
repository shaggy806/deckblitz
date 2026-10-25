import { defineCard } from "../define.js";

// EDHREC rank 22872.
const TEXT =
  "As long as an opponent has 10 or less life, this creature gets +2/+1 and has intimidate. (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)";

export default defineCard({
  name: "Guul Draz Vampire",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", who: "opponent", atMost: 10 },
      grantPt: [2, 1],
      grantKeywords: ["intimidate"],
      text: TEXT,
    },
  ],
});
