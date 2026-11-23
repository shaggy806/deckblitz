import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).
export default defineCard({
  name: "Golgari Death Swarm",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Bat", "Fungus", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance",
});
