import { defineCard } from "../define.js";

export default defineCard({
  name: "Hookhand Mariner",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["daybound"],
  text: "Daybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Hookhand Mariner", "Riphook Raider"],
  transform: true,
});
