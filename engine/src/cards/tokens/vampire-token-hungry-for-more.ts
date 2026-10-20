import { defineCard } from "../define.js";

// Hungry for More's Vampire token.

export default defineCard({
  name: "Vampire Token (Hungry for More)",
  art: "0f8fe08d-b469-4471-8a7d-cf75850ba312",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 1,
  keywords: ["trample", "lifelink", "haste"],
  text: "Trample, lifelink, haste",
});
