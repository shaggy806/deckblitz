import { defineCard } from "../define.js";

export default defineCard({
  name: "Llanowar Knight",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 2,
  toughness: 2,
  text: "Protection from black",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
