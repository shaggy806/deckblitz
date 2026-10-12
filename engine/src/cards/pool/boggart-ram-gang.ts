import { defineCard } from "../define.js";

export default defineCard({
  name: "Boggart Ram-Gang",
  manaCost: "{R/G}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["haste", "wither"],
  text: "Haste\nWither (This deals damage to creatures in the form of -1/-1 counters.)",
});
