import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// Planar Chaos.
const VANISHING = vanishing(4);

export default defineCard({
  name: "Calciderm",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  keywords: ["shroud"],
  text: "Shroud (This creature can't be the target of spells or abilities.)\nVanishing 4 (This creature enters with four time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)",
  static: [...VANISHING.static],
  triggered: [...VANISHING.triggered],
});
