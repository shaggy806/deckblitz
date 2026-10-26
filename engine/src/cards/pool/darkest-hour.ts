import { defineCard } from "../define.js";

// Urza's Saga. Layer 5: every creature is mono-black (the ruling).
export default defineCard({
  name: "Darkest Hour",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "All creatures are black.",
  static: [{ affects: { scope: "all-creatures" }, setColors: ["B"], text: "All creatures are black." }],
});
