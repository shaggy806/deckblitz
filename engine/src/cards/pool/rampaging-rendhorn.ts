import { defineCard } from "../define.js";

export default defineCard({
  name: "Rampaging Rendhorn",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["riot"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)",
});
