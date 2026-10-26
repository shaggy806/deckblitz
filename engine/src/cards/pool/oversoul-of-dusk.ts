import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 24746.

const TEXT = "Protection from blue, from black, and from red";

export default defineCard({
  name: "Oversoul of Dusk",
  manaCost: "{G/W}{G/W}{G/W}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 5,
  toughness: 5,
  text: TEXT,
  static: [{ affects: { scope: "self" }, protection: { colors: ["U", "B", "R"] }, text: TEXT }],
});
