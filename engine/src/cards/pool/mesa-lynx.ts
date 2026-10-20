import { defineCard } from "../define.js";

// EDHREC rank 26304. Zendikar Rising.

export default defineCard({
  name: "Mesa Lynx",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 1,
  text: "During turns other than yours, this creature gets +0/+2.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      grantPt: [0, 2],
      text: "During turns other than yours, this creature gets +0/+2.",
    },
  ],
});
