import { defineCard } from "../define.js";

export default defineCard({
  name: "Scuzzback Scrapper",
  manaCost: "{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)",
});
