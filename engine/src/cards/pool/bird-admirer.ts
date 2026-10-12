import { defineCard } from "../define.js";

export default defineCard({
  name: "Bird Admirer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Werewolf"],
  power: 1,
  toughness: 4,
  keywords: ["reach", "daybound"],
  text: "Reach\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Bird Admirer", "Wing Shredder"],
  transform: true,
});
