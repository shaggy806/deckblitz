import { defineCard } from "../define.js";

// A 1/1 red Elemental Cat with haste — Firecat Blitz's token.
export default defineCard({
  name: "Elemental Cat Token",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste",
});
