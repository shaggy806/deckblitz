import { defineCard } from "../define.js";

export default defineCard({
  name: "Head of Security",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Andorian", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)",
});
