import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 31813.

const TEXT = "This creature can't be blocked by black creatures.";

export default defineCard({
  name: "Raven's Run Dragoon",
  manaCost: "{2}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { colors: ["B"] }, text: TEXT }],
});
