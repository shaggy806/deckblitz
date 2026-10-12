import { defineCard } from "../define.js";

export default defineCard({
  name: "Infiltrator il-Kor",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kor", "Rogue"],
  power: 3,
  toughness: 1,
  keywords: ["shadow"],
  suspend: { n: 2, cost: "{1}{U}" },
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nSuspend 2—{1}{U} (Rather than cast this card from your hand, you may pay {1}{U} and exile it with two time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
});
