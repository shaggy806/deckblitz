import { defineCard } from "../define.js";

// EDHREC rank 31824.

export default defineCard({
  name: "Sickbay Orderly",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Caitian", "Doctor"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)",
});
