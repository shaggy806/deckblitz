import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+1 as long as you control an Ajani planeswalker.";

export default defineCard({
  name: "Court Cleric",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Ajani" }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
