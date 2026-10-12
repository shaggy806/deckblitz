import { defineCard } from "../define.js";

export default defineCard({
  name: "Tireless Hauler",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance", "daybound"],
  text: "Vigilance\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Tireless Hauler", "Dire-Strain Brawler"],
  transform: true,
});
