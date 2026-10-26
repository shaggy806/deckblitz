import { defineCard } from "../define.js";

// EDHREC rank 29854.

const TEXT = "This creature can't be blocked by more than one creature.";

export default defineCard({
  name: "Norwood Riders",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: TEXT }],
});
