import { defineCard } from "../define.js";

export default defineCard({
  name: "Soltari Foot Soldier",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)",
});
