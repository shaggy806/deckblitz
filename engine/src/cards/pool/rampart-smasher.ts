import { defineCard } from "../define.js";

// EDHREC rank 30431.

const TEXT = "This creature can't be blocked by Knights or Walls.";

export default defineCard({
  name: "Rampart Smasher",
  manaCost: "{R/G}{R/G}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 5,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { subtypes: ["Knight", "Wall"] }, text: TEXT }],
});
