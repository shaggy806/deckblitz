import { defineCard } from "../define.js";

// EDHREC rank 22773.

export default defineCard({
  name: "Tel-Jilad Fallen",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["infect"],
  text: "Protection from artifacts\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});
