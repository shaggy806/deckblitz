import { defineCard } from "../define.js";

export default defineCard({
  name: "Oona's Gatewarden",
  manaCost: "{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["defender", "flying", "wither"],
  text: "Defender, flying\nWither (This deals damage to creatures in the form of -1/-1 counters.)",
});
