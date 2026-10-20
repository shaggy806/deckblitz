import { defineCard } from "../define.js";

// Ominous Roost's Bird token.

export default defineCard({
  name: "Bird Token (Ominous Roost)",
  art: "a0f7b2f0-16d3-4db0-a737-c7b8dcb9d5de",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
