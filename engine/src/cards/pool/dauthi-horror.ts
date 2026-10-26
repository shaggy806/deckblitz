import { defineCard } from "../define.js";

// EDHREC rank 9133.

const WHITE_TEXT = "This creature can't be blocked by white creatures.";

export default defineCard({
  name: "Dauthi Horror",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Horror"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${WHITE_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { colors: ["W"] }, text: WHITE_TEXT }],
});
