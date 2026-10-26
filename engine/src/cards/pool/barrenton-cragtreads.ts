import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 31820.

const TEXT = "This creature can't be blocked by red creatures.";

export default defineCard({
  name: "Barrenton Cragtreads",
  manaCost: "{2}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Scout"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { colors: ["R"] }, text: TEXT }],
});
