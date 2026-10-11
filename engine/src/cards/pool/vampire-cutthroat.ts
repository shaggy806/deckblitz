import { defineCard } from "../define.js";

// EDHREC rank 6774.
export default defineCard({
  name: "Vampire Cutthroat",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["skulk", "lifelink"],
  text:
    "Skulk (This creature can't be blocked by creatures with greater power.)\n" +
    "Lifelink (Damage dealt by this creature also causes you to gain that much life.)",
});
