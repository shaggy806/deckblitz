import { defineCard } from "../define.js";

// EDHREC rank 24917.

const TEXT = "This creature can't be blocked by more than one creature.";

export default defineCard({
  name: "Bristling Boar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: TEXT }],
});
