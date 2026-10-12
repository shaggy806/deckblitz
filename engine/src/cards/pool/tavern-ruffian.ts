import { defineCard } from "../define.js";

export default defineCard({
  name: "Tavern Ruffian",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Werewolf"],
  power: 2,
  toughness: 5,
  keywords: ["daybound"],
  text: "Daybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Tavern Ruffian", "Tavern Smasher"],
  transform: true,
});
