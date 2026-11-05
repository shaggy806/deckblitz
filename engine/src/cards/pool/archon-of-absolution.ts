import { defineCard } from "../define.js";

// EDHREC rank 7543.

export default defineCard({
  name: "Archon of Absolution",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nProtection from white (This creature can't be blocked, targeted, dealt damage, enchanted, or equipped by anything white.)\nCreatures can't attack you or planeswalkers you control unless their controller pays {1} for each of those creatures.",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
    {
      affects: { scope: "self" },
      attackTax: { generic: 1, covers: "you-and-planeswalkers" },
      text: "Creatures can't attack you or planeswalkers you control unless their controller pays {1} for each of those creatures.",
    },
  ],
});
