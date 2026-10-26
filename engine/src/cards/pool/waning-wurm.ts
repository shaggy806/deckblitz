import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// Planar Chaos.
const VANISHING = vanishing(2);

export default defineCard({
  name: "Waning Wurm",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wurm"],
  power: 7,
  toughness: 6,
  text: "Vanishing 2 (This creature enters with two time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)",
  static: [...VANISHING.static],
  triggered: [...VANISHING.triggered],
});
