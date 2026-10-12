import { defineCard } from "../define.js";

export default defineCard({
  name: "Rustrazor Butcher",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 2,
  keywords: ["first-strike", "wither"],
  text: "First strike\nWither (This deals damage to creatures in the form of -1/-1 counters.)",
});
