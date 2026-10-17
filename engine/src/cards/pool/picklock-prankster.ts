import { defineCard } from "../define.js";

export default defineCard({
  name: "Picklock Prankster",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance",
  faces: ["Picklock Prankster", "Free the Fae"],
  adventure: true,
});
