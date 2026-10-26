import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 15085.

export default defineCard({
  name: "Spirit of the Hearth",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Spirit"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nYou have hexproof. (You can't be the target of spells or abilities your opponents control.)",
  static: [
    {
      affects: { scope: "self" },
      playerHexproof: true,
      text: "You have hexproof. (You can't be the target of spells or abilities your opponents control.)",
    },
  ],
});
