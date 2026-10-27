import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 28847.

export default defineCard({
  name: "Crested Craghorn",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goat", "Beast"],
  power: 4,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nProvoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
  triggered: [provoke()],
});
