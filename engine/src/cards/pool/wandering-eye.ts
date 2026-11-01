import { defineCard } from "../define.js";

// EDHREC rank 21581.

const TEXT = "Players play with their hands revealed.";

export default defineCard({
  name: "Wandering Eye",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [{ affects: { scope: "self" }, visibility: { handsRevealed: "each-player" }, text: TEXT }],
});
