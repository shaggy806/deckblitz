import { defineCard } from "../define.js";

// Dissension. "Is all colors" is its printed colours, so it holds in every
// zone (the ruling) — Sphinx of the Guildpact's shape.
export default defineCard({
  name: "Transguild Courier",
  manaCost: "{4}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: "Transguild Courier is all colors.",
});
