import { defineCard } from "../define.js";

// EDHREC rank 27674. "Can't be blocked except by black creatures" is can't be
// blocked by nonblack ones (Zulaport Enforcer's shape).

const TEXT = "This creature can't be blocked except by black creatures.";

export default defineCard({
  name: "Dread Warlock",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Warlock"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notColors: ["B"] }, text: TEXT }],
});
