import { defineCard } from "../define.js";

// EDHREC rank 31639. Dread Warlock's shape: can't be blocked by nonblack creatures.

const TEXT = "This creature can't be blocked except by black creatures.";

export default defineCard({
  name: "Prowling Nightstalker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notColors: ["B"] }, text: TEXT }],
});
