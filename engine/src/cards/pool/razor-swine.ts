import { defineCard } from "../define.js";

export default defineCard({
  name: "Razor Swine",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Boar"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike", "infect"],
  text: "First strike\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
