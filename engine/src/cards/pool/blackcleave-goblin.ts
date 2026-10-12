import { defineCard } from "../define.js";

export default defineCard({
  name: "Blackcleave Goblin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Goblin", "Zombie"],
  power: 2,
  toughness: 1,
  keywords: ["haste", "infect"],
  text: "Haste\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
