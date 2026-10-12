import { defineCard } from "../define.js";

export default defineCard({
  name: "Thalakos Sentry",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos", "Soldier"],
  power: 1,
  toughness: 2,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)",
});
