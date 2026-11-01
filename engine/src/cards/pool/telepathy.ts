import { defineCard } from "../define.js";

// EDHREC rank 5452.

const TEXT = "Your opponents play with their hands revealed.";

export default defineCard({
  name: "Telepathy",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, visibility: { handsRevealed: "opponents" }, text: TEXT }],
});
