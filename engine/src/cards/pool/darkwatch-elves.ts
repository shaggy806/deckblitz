import { defineCard } from "../define.js";

export default defineCard({
  name: "Darkwatch Elves",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  cycling: { cost: "{2}" },
  text: "Protection from black\nCycling {2} ({2}, Discard this card: Draw a card.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
