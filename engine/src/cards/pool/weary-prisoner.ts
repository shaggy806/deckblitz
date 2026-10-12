import { defineCard } from "../define.js";

export default defineCard({
  name: "Weary Prisoner",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 6,
  keywords: ["defender", "daybound"],
  text: "Defender\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Weary Prisoner", "Wrathful Jailbreaker"],
  transform: true,
});
