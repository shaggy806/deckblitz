import { defineCard } from "../define.js";

export default defineCard({
  name: "Fearful Villager",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 3,
  keywords: ["menace", "daybound"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Fearful Villager", "Fearsome Werewolf"],
  transform: true,
});
