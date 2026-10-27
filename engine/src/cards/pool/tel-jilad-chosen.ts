import { defineCard } from "../define.js";

// EDHREC rank 29927.

export default defineCard({
  name: "Tel-Jilad Chosen",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Protection from artifacts",
  static: [
    {
      affects: { scope: "self" },
      protection: { types: ["artifact"] },
      text: "Protection from artifacts",
    },
  ],
});
