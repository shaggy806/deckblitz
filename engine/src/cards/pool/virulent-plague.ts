import { defineCard } from "../define.js";

// EDHREC rank 17247. Every player's creature tokens.
export default defineCard({
  name: "Virulent Plague",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Creature tokens get -2/-2.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true } },
      grantPt: [-2, -2],
      text: "Creature tokens get -2/-2.",
    },
  ],
});
