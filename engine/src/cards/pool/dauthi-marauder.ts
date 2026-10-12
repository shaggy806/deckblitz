import { defineCard } from "../define.js";

export default defineCard({
  name: "Dauthi Marauder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Minion"],
  power: 3,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)",
});
