import { defineCard } from "../define.js";

// A 2/2 black Phyrexian Zombie — Nested Ghoul's token. Scryfall has no token
// printing of it (checked 2026-10-26 against the Oracle snapshot).
export default defineCard({
  name: "Phyrexian Zombie Token",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 2,
  toughness: 2,
});
