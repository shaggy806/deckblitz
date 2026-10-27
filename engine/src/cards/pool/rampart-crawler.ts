import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 28930.

const TEXT = "This creature can't be blocked by Walls.";

export default defineCard({
  name: "Rampart Crawler",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lizard", "Mercenary"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { subtype: "Wall" }, text: TEXT }],
});
