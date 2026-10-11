import { defineCard } from "../define.js";

// A 1/1 green Elf — Thranduil, Sindarin Liege's token. ("Elf Warrior Token"
// and "Elf Druid Token" are other creature types.)
export default defineCard({
  name: "Elf Token",
  art: "761c7c31-c6c5-44e2-a845-f590542b6eda",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
});
