import { defineCard } from "../define.js";

// EDHREC rank 6856.
export default defineCard({
  name: "Glistener Elf",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
