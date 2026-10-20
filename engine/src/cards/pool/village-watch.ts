import { defineCard } from "../define.js";

// EDHREC rank 11147. A daybound werewolf; the back face is Village Reavers.

export default defineCard({
  name: "Village Watch",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 4,
  toughness: 3,
  keywords: ["haste", "daybound"],
  text: "Haste\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Village Watch", "Village Reavers"],
  transform: true,
});
