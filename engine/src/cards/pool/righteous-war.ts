import { defineCard } from "../define.js";

// EDHREC rank 22758.

export default defineCard({
  name: "Righteous War",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: "White creatures you control have protection from black.\nBlack creatures you control have protection from white.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" } },
      protection: { colors: ["B"] },
      text: "White creatures you control have protection from black.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"], controlledBy: "you" } },
      protection: { colors: ["W"] },
      text: "Black creatures you control have protection from white.",
    },
  ],
});
