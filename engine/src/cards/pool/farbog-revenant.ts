import { defineCard } from "../define.js";

export default defineCard({
  name: "Farbog Revenant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["skulk", "lifelink"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)",
});
