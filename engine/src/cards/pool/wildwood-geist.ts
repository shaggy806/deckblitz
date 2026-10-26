import { defineCard } from "../define.js";

// Dark Ascension (DKA). EDHREC rank 31737.

export default defineCard({
  name: "Wildwood Geist",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "During your turn, this creature gets +2/+2.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantPt: [2, 2],
      text: "During your turn, this creature gets +2/+2.",
    },
  ],
});
