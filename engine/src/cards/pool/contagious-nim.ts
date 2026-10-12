import { defineCard } from "../define.js";

export default defineCard({
  name: "Contagious Nim",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
