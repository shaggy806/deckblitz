import { defineCard } from "../define.js";


export default defineCard({
  name: "Mek'leth Berserker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Berserker"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
});
