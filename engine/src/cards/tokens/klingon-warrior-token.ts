import { defineCard } from "../define.js";

// The Klingon Warrior token, made by several Star Trek cards.

export default defineCard({
  name: "Klingon Warrior Token",
  art: "b7897f31-509e-4099-b9b4-c6214b80f29d",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste",
});
